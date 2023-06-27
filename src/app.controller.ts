import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { dotProduct, localField, outputSigma } from './_lib/math_utils';
import { TpmService } from './tpm/tpm.service';
import { SyncService } from './sync/sync.service';


@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly syncService: SyncService) { }
  


  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("new-tpm")
  getInitialToken(@Body() data: any) {
    return this.syncService.newTpm(data.deviceId);
  }
}
