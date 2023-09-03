import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SyncService } from './sync/sync.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
        host: process.env.MQTT_HOST,
        hostname: process.env.MQTT_HOST,
        port: process.env.MQTT_PORT,
        protocol: 'mqtt',
    }
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
SyncService.connectedTpms = []