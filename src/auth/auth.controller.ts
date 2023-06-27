import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TpmDatabaseService } from 'src/database/tpmDatabase.service';
import { ChallengeDatabaseService } from 'src/database/challengeDatabase.service';
import { PendingChallenge } from 'src/database/challenge.entity';

export class RequestChallengeDto {
    token_uid: string;
}

export class AwnserChallengeDto {
    token_uid: string;
    awnser: string;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
        private readonly tpmDatabaseService: TpmDatabaseService,
        private readonly challengeDatabaseService: ChallengeDatabaseService,
        ) { }

    @Post('request-challenge')
    async postRequestChallenge(@Body() data: RequestChallengeDto) {
        if(AuthService.reqCount < 1) {
            AuthService.reqCount += 1
            console.log('First request recieved');
        }
        const token = data.token_uid;
        if(!token) return 'No token provided!';
        const deviceInstance = await this.tpmDatabaseService.findOne(token);
        // const previousChallenge = await this.challengeDatabaseService.findOne(data.token_uid); //Define behaviour for previous challenges
        if (!!deviceInstance) {
            const pendingChallenge = await this.challengeDatabaseService.findOne(data.token_uid);
            if(!!pendingChallenge) return {challenge: [pendingChallenge.first,pendingChallenge.second]};
            const challenge = this.authService.getRandomChallenge(deviceInstance.TPM_K);            
            const newPendingChallenge : PendingChallenge = new PendingChallenge();
            newPendingChallenge.token_uid = data.token_uid
            newPendingChallenge.first = challenge[0]
            newPendingChallenge.second = challenge[1]
            this.challengeDatabaseService.create(newPendingChallenge)
            return { challenge }
        }

        return "Error: Not found in device list";
    }

    @Post('awnser-challenge')
    async postAwnserChallenge(@Body() data: AwnserChallengeDto) {
        const pendingChallenge = await this.challengeDatabaseService.findOne(data.token_uid);
        const savedTpm = await this.tpmDatabaseService.findOne(data.token_uid);
        if (!!pendingChallenge) {
            const checkResponse = this.authService.checkPendingChallenge(data.awnser,pendingChallenge,savedTpm);
            this.challengeDatabaseService.delete(pendingChallenge.id)
            if(! checkResponse) console.log("Device unauthorized.");
            else console.log("Device authorized");
            return { authorization: checkResponse }
        }
    }

    @Get('test')
    testEndpoint() {
        return this.authService.testFunction()
    }
}
