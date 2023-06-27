import { Injectable } from '@nestjs/common';
import { SyncedTpm } from './_lib/tpm_utils';

@Injectable()
export class AppService {

  static savedTpms: SyncedTpm[] = []

  getHello(): string {
    return 'Hello World!';
  }

}
