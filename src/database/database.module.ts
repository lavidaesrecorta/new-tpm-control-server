import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseController } from './database.controller';
import { SavedTpm } from './tpm.entity';
import { TpmDatabaseService } from './tpmDatabase.service';
import { ChallengeDatabaseService } from './challengeDatabase.service';
import { PendingChallenge } from './challenge.entity';
import { SessionDatabaseService } from './syncSessionDatabase.service';
import { SyncSession } from './syncSession.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([SavedTpm,PendingChallenge, SyncSession]),
    ],
    providers: [TpmDatabaseService,ChallengeDatabaseService, SessionDatabaseService],
    controllers: [DatabaseController],
    exports: [TpmDatabaseService, ChallengeDatabaseService, SessionDatabaseService],
  })
export class DatabaseModule {}
