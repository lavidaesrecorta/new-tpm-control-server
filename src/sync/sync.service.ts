import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConnectedTpm, calculateOutput, checkWeights, generateRandomStimulus, generateRandomWeights, hebbianRule } from 'src/_lib/tpm_utils';
import { AppService } from 'src/app.service';
import { TpmDatabaseService } from 'src/database/tpmDatabase.service';
import { SavedTpm } from 'src/database/tpm.entity';
import { SyncSession } from 'src/database/syncSession.entity';
import { SessionDatabaseService } from 'src/database/syncSessionDatabase.service';


export enum TPM_STATES {
    NOT_INITIALIZED = -1,
    INITIALIZED = 1,
    CALCULATING = 2,
    LEARNING = 3,
    ON_SYNC = 4,
}

interface ActiveSession {
    deviceToken: string;
    status: string;
    learnIterations: number;
    startTime: number;
    endTime?: number;
}

const knl_tuples = [
    [3,3,3],
    [4,3,3],
    [5,3,3],
    [6,3,3],
    [7,3,3],
    [7,4,3],
    [7,5,3],
    [7,6,3],
    [7,7,3],
    [7,7,4],
    [7,7,5],
    [7,7,6],
    [7,7,7],
]


@Injectable()
export class SyncService {
    constructor(
        @Inject('TPM_SERVICE') private client: ClientProxy,
        private readonly tpmDatabaseService: TpmDatabaseService,
        private readonly sessionDatabaseService: SessionDatabaseService,
    ) { }

    static connectedTpms: ConnectedTpm[];
    static activeSessions: ActiveSession[] = [];

    static currentSettingsIndex = 0;
    static currentSettingsIterations = 0;

    newTpm(deviceId: string) {

        if(SyncService.currentSettingsIterations > 5){
            SyncService.currentSettingsIndex += 1;
            SyncService.currentSettingsIterations = 0;
            if(SyncService.currentSettingsIndex == knl_tuples.length) return
        } else {
            SyncService.currentSettingsIterations += 1;
        }

        const k = knl_tuples[SyncService.currentSettingsIndex][0];
        const n = knl_tuples[SyncService.currentSettingsIndex][1];
        const l = knl_tuples[SyncService.currentSettingsIndex][2];
        const timestamp = `${Date.now()}`; 
        const newToken = this.createNewToken(deviceId,timestamp)
        const tpmIndex = SyncService.connectedTpms.findIndex((tpm) => tpm.deviceToken == newToken)
        if (tpmIndex == -1) {
            const newTpm: ConnectedTpm = {
                deviceToken: newToken,
                k: k,
                n: n,
                l: l,
                weights: generateRandomWeights(k, n, l),
                lastStimulus: [],
                lastOutput: -1,
                iterState: -1,
                iterCount: -1,
            };
            SyncService.connectedTpms.push(newTpm);

            const newSession: ActiveSession = {
                deviceToken: newToken,
                status: "INITIALIZED",
                startTime: Date.now(),
                learnIterations: 0
            }

            SyncService.activeSessions.push(newSession);

            //emit something to esp32 so it knows its registered
            this.sendInitialConfig(SyncService.connectedTpms.length - 1, deviceId)
            // return true;
            console.log(`Creating new TPM with ${k}, ${n}, ${l}`)
            return {deviceToken: newToken, settings: { 'k': k, 'n': n, 'l': l } }
        }

        return false;
    }

    checkWeightSync(devicetoken: string, weights: number[][]): boolean {
        //check weights directly for now, add hash tomorrow
        const tpmIndex = SyncService.connectedTpms.findIndex((tpm) => tpm.deviceToken == devicetoken)
        if (tpmIndex == -1) return false;

        if (checkWeights(weights, SyncService.connectedTpms[tpmIndex].weights)) {
            console.log("Sync finished:");
            console.log(weights);
            console.log('------------');
            console.log(SyncService.connectedTpms[tpmIndex].weights);
            const syncedTpm = SyncService.connectedTpms[tpmIndex]
            AppService.savedTpms.push({deviceToken: syncedTpm.deviceToken, k: syncedTpm.k, n: syncedTpm.n, l: syncedTpm.l, weights: syncedTpm.weights})
            this.sendSaveInstruction(tpmIndex)
            return true;
        }
        this.sendNewStimulus(tpmIndex);

        console.log('##########');
        console.log(weights);
        console.log('------------');
        console.log(SyncService.connectedTpms[tpmIndex].weights);

        return false;
    }

    checkOutputSync(deviceToken: string, output: number) {
        const tpmIndex = SyncService.connectedTpms.findIndex((tpm) => tpm.deviceToken == deviceToken)
        if (tpmIndex == -1) return false;
        const localTpm = SyncService.connectedTpms[tpmIndex]
        if (output == localTpm.lastOutput) {
            //if true we learn
            console.log('#############');
            console.log(SyncService.connectedTpms[tpmIndex].weights);
            for (let index = 0; index < localTpm.weights.length; index++) {
                const neuronWeights = hebbianRule(output, localTpm.lastStimulus[index], localTpm.weights[index], localTpm.n, localTpm.l)
                SyncService.connectedTpms[tpmIndex].weights[index] = neuronWeights
            }
            console.log('#############');
            console.log(SyncService.connectedTpms[tpmIndex].weights);

            return true
        }
        console.log('Weights dont match');
        //if not, send a new stimulus
        this.sendNewStimulus(tpmIndex);
        return false
    }

    learn(deviceToken: string) {
        const tpmIndex = SyncService.connectedTpms.findIndex((tpm) => tpm.deviceToken == deviceToken)
        if (tpmIndex == -1) return false;
        const localTpm = SyncService.connectedTpms[tpmIndex]
        for (let index = 0; index < localTpm.weights.length; index++) {
            const neuronWeights = hebbianRule(localTpm.lastOutput, localTpm.lastStimulus[index], localTpm.weights[index], localTpm.n, localTpm.l)
            localTpm.weights[index] = neuronWeights
        }
        SyncService.activeSessions[tpmIndex].learnIterations += 1;
    }

    abortSession(tpmIndex: number){
        SyncService.activeSessions[tpmIndex].status = "ABORTED";
        this.saveSessionInDatabase(tpmIndex);
        SyncService.connectedTpms.splice(tpmIndex, 1)
        SyncService.activeSessions.splice(tpmIndex, 1)
    }

    sendNewStimulus(tpmIndex: number) {
        const [k, n] = [SyncService.connectedTpms[tpmIndex].k, SyncService.connectedTpms[tpmIndex].n]
        const newRandomStimulus = generateRandomStimulus(k, n);
        SyncService.connectedTpms[tpmIndex].lastStimulus = newRandomStimulus
        SyncService.connectedTpms[tpmIndex].iterCount += 1
        const localOutput = calculateOutput(SyncService.connectedTpms[tpmIndex].n, SyncService.connectedTpms[tpmIndex].weights, SyncService.connectedTpms[tpmIndex].lastStimulus)

        this.client.emit(`${SyncService.connectedTpms[tpmIndex].deviceToken}/stimulate`, { 'stimulus': newRandomStimulus, 'output': localOutput })
    }
    sendInitialConfig(tpmIndex: number,deviceId: string) {
        console.log(deviceId);
        
        const [k, n, l] = [SyncService.connectedTpms[tpmIndex].k, SyncService.connectedTpms[tpmIndex].n, SyncService.connectedTpms[tpmIndex].l]
        this.client.emit(`${deviceId}/init`, { deviceToken: SyncService.connectedTpms[tpmIndex].deviceToken, settings: { 'k': k, 'n': n, 'l': l } })
    }

    sendSaveInstruction(tpmIndex: number){
        const newSavedTpm : SavedTpm = new SavedTpm();
        newSavedTpm.token_uid = SyncService.connectedTpms[tpmIndex].deviceToken
        newSavedTpm.TPM_K=SyncService.connectedTpms[tpmIndex].k
        newSavedTpm.TPM_N=SyncService.connectedTpms[tpmIndex].n
        newSavedTpm.TPM_L=SyncService.connectedTpms[tpmIndex].l
        newSavedTpm.TPM_weights= JSON.stringify(SyncService.connectedTpms[tpmIndex].weights)
        this.tpmDatabaseService.create(newSavedTpm)

        SyncService.activeSessions[tpmIndex].status = "ON_SYNC"
        this.saveSessionInDatabase(tpmIndex)

        this.client.emit(`${SyncService.connectedTpms[tpmIndex].deviceToken}/save`, {status: true})
    }

    saveSessionInDatabase(tpmIndex: number){
        const newSavedSession : SyncSession = new SyncSession();
        newSavedSession.token_uid = SyncService.activeSessions[tpmIndex].deviceToken
        newSavedSession.start_time = SyncService.activeSessions[tpmIndex].startTime 
        newSavedSession.end_time = Date.now()
        newSavedSession.status = SyncService.activeSessions[tpmIndex].status
        newSavedSession.TPM_K=SyncService.connectedTpms[tpmIndex].k
        newSavedSession.TPM_N=SyncService.connectedTpms[tpmIndex].n
        newSavedSession.TPM_L=SyncService.connectedTpms[tpmIndex].l
        this.sessionDatabaseService.create(newSavedSession)
    }

    createNewToken(deviceToken: string, timestamp: string){
        return `${deviceToken}${timestamp}`
    }
}
