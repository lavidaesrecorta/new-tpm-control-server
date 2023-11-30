import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseController } from './database.controller';
import { SavedTpm } from './tpm.entity';
import { TpmDatabaseService } from './tpmDatabase.service';
import { ChallengeDatabaseService } from './challengeDatabase.service';
import { PendingChallenge } from './challenge.entity';
import { SessionDatabaseService } from './syncSessionDatabase.service';
import { SyncSession } from './syncSession.entity';
import { SensorDatabaseService } from './sensorDatabase.service';
import { SensorData } from './sensor_data.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([SavedTpm,PendingChallenge, SyncSession, SensorData]),
    ],
    providers: [TpmDatabaseService,ChallengeDatabaseService, SessionDatabaseService, SensorDatabaseService],
    controllers: [DatabaseController],
    exports: [TpmDatabaseService, ChallengeDatabaseService, SessionDatabaseService, SensorDatabaseService],
  })
export class DatabaseModule {}
