import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { MqttController } from './mqtt/mqtt.controller';
import { TpmService } from './tpm/tpm.service';
import { SyncService } from './sync/sync.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseController } from './database/database.controller';
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({ 
  imports: [
    ClientsModule.register([
    {
      name: 'TPM_SERVICE',
      transport: Transport.MQTT,
      options: {
        host: process.env.MQTT_HOST,
        hostname: process.env.MQTT_HOST,
        port: process.env.MQTT_PORT,
        protocol: 'mqtt',
      }
    },
  ]),
    DatabaseModule,
    TypeOrmModule.forRoot({
    type: 'sqlite',
    database: 'db',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),],
  controllers: [AppController, AuthController, MqttController],
  providers: [AppService, AuthService, TpmService, SyncService],
})
export class AppModule { }
