import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SyncService } from './sync/sync.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      host: "localhost",
      port: 1883,
      protocol: 'mqtt',
    }
  });
  await app.startAllMicroservices();
  await app.listen(3000);
}
bootstrap();
SyncService.connectedTpms = []