import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ReflectionService } from '@grpc/reflection';

const logger = new Logger('Main-Service-A');

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'todo',
        protoPath: join(__dirname, 'proto/todo.proto'),
        url: '0.0.0.0:5001',
        onLoadPackageDefinition: (pkg, server) => {
          new ReflectionService(pkg).addToServer(server);
        },
      },
    },
  );

  await app.listen();
  logger.log('Todo Service A is running on: 0.0.0.0:5001');
}
bootstrap();