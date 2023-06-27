import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ConnectedTpm } from 'src/_lib/tpm_utils';
import { SyncService, TPM_STATES } from 'src/sync/sync.service';

@Controller('mqtt')
export class MqttController {
    constructor(private readonly syncService: SyncService) { }

    // @MessagePattern('tpm-notifications/init-request')
    // getInitRequest(@Payload() data) {
    //     // if(isTpmInitMsg(data)){
    //     //   initialize in service
    //     this.syncService.newTpm(data.deviceId)
    //     return;
    //     // }
    //     console.log("TPM Init request malformed.");
    //     return;
    // }

    @MessagePattern('tpm-notifications/initial-update')
    getInitialUpdate(@Payload() data) {
        
        if (data.iteration_count === 0) {
            const tpmIndex = SyncService.connectedTpms.findIndex((tpm) => tpm.deviceToken == data.deviceToken)
            if (tpmIndex == -1) return;
            SyncService.connectedTpms[tpmIndex].iterCount = 0;
            SyncService.connectedTpms[tpmIndex].iterState = TPM_STATES.INITIALIZED;
            // check sync and that will start learn phase
            this.syncService.checkWeightSync(data.deviceToken, data.weights);
        }
    }

    @MessagePattern('tpm-notifications/weight-update')
    getWeights(@Payload() data) { //if we get this msg, then the outputs match in the esp side and we need to learn
        // if(isTpmWeightsMsg(data))
        console.log('New Weight request')
        this.syncService.learn(data.deviceToken);
        this.syncService.checkWeightSync(data.deviceToken, data.weights);
    }

    @MessagePattern('tpm-notifications/stimulus-request')
    getStimulusRequest(@Payload() data) {
        console.log('New Stimulus request from device');
        //   if(isTpmOutputMsg(data)){
        const tpmIndex = SyncService.connectedTpms.findIndex((tpm) => tpm.deviceToken == data.deviceToken)
        if (tpmIndex == -1) return;
        this.syncService.sendNewStimulus(tpmIndex)
        // }
    }
}
