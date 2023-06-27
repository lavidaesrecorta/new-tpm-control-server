import { Controller, Get } from '@nestjs/common';
import { TpmDatabaseService } from './tpmDatabase.service';
import { ChallengeDatabaseService } from './challengeDatabase.service';
import { SessionDatabaseService } from './syncSessionDatabase.service';

@Controller('database')
export class DatabaseController {
    constructor(
        private readonly tpmDatabaseService: TpmDatabaseService,
        private readonly challengeDatabaseService: ChallengeDatabaseService,
        private readonly sessionDatabaseService: SessionDatabaseService,
    ) {}
    
    @Get('tpms')
    async getTpms() {
      return await this.tpmDatabaseService.findAll();
    }

    @Get('challenges')
    async getChallenges() {
      return await this.challengeDatabaseService.findAll();
    }

    @Get('sessions')
    async getSessions() {
      return await this.sessionDatabaseService.findAll();
    }

    @Get('weights')
    async getAllWeights() {
      const allTpms =  await this.tpmDatabaseService.findAll();
      let weightsList = allTpms.map((tpm)=>{return JSON.parse(tpm.TPM_weights) as Int8Array[]})

      return weightsList
    }

    @Get('test-xor')
    async testXor(){
      const allTpms =  await this.tpmDatabaseService.findAll();
      const token = allTpms[0].token_uid
      const savedWeights: Int8Array[] = JSON.parse(allTpms[0].TPM_weights)
      let xorPass = [];
      for (let i = 0; i < savedWeights[0].length; i++) {
          const element = savedWeights[0][i];
          const token_char = token.charCodeAt(i)          
          const xorResult = element^token_char
          xorPass.push(xorResult)
      }

      return xorPass

    }

    @Get('drop-all-tpms')
    async dropAllTpms() {
      return await this.tpmDatabaseService.deleteAll();
    }
    @Get('drop-all-challenges')
    async dropAllChallenges() {
      return await this.challengeDatabaseService.deleteAll();
    }

    @Get('list-tables')
    async getTables(){
      return await this.tpmDatabaseService.listAllTables();
    }
}
