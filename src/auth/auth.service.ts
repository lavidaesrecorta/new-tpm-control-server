import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { PendingChallenge } from 'src/database/challenge.entity';
import { SavedTpm } from 'src/database/tpm.entity';
interface TreeParityMachine {
    k: number;
    n: number;
    l: number;
    weights: number[][];
}

interface ConnectedDevice {
    deviceId: string;
    tpm: TreeParityMachine;
    pendingChallenge?: [number, number]
}



@Injectable()
export class AuthService {
    static connectedDevices: ConnectedDevice[];

    public static reqCount = 0;

    executeChallenge(a: number[], b: number[]) {
        if (a.length != b.length) return;
        let dotResult = 0
        for (let index = 0; index < a.length; index++) {
            const elementA = a[index];
            const elementB = b[index];
            dotResult += elementA * elementB;
        }
        return dotResult;
    }

    executeChallenge2(a: number[], b: Int8Array) {
        if (a.length != b.length) return;
        let dotResult = 0
        for (let index = 0; index < a.length; index++) {
            const elementA = a[index];
            const elementB = b[index];
            dotResult += elementA * elementB;
        }
        return dotResult;
    }

    existsOnDeviceList(deviceId: string): ConnectedDevice {
        for (let index = 0; index < AuthService.connectedDevices.length; index++) {
            const element = AuthService.connectedDevices[index];
            if (element.deviceId == deviceId) return element;
        }
        return null;
    }

    getRandomChallenge(k: number): [number, number] {
        if(!k) throw ReferenceError;        
        const a = Math.floor(k * Math.random());
        let b = Math.floor(k * Math.random());
        while (b == a) {
            b = Math.floor(k * Math.random());
        }
        return [a, b];
    }

    checkPendingChallenge(deviceAwnser: string, pendingChallenge: PendingChallenge, savedTpm: SavedTpm) {
            if (pendingChallenge != null) {
                const tokenLength = savedTpm.token_uid.length
                const savedWeights = JSON.parse(savedTpm.TPM_weights) as ArrayBuffer[];
                const firstWeightsArray = new Uint8Array(savedWeights[pendingChallenge.first])
                let testList = []
                let xorPass = [];
                for (let i = 0; i < firstWeightsArray.length; i++) {
                    const element = firstWeightsArray[i];
                    const token_char = savedTpm.token_uid.charCodeAt(i%tokenLength)    
                    testList.push(token_char)
                    const xorResult = element^token_char
                    xorPass.push(xorResult)
                }
                
                const result = this.executeChallenge2(xorPass, new Int8Array(savedWeights[pendingChallenge.second]));
                const hashedResult = createHash('sha256').update(result.toString()).digest('hex')
                if(hashedResult === deviceAwnser){
                    return true
                } else {
                    return false
                }
            }
    }


    testFunction(){
        const hashedResult = createHash('sha256').update("1").digest('hex')
        return hashedResult
    }
}
// combinar id con weights
  // sumar

  // cambiar id por nombre de usuario y dejar oculto el id