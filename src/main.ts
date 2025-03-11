// src/main.ts for Service A
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // Create a logger instance for the bootstrap process
  const logger = new Logger('Bootstrap');
  
  // Create the main HTTP application using the AppModule
  const app = await NestFactory.create(AppModule);
  
  // Get the ConfigService from the application to access environment variables
  const configService = app.get(ConfigService);
  
  // Add validation pipe to automatically validate incoming requests
  // based on the validation decorators in the DTOs
  app.useGlobalPipes(new ValidationPipe());
  
  // Get configuration values from environment variables with fallbacks
  const grpcHost = configService.get('GRPC_HOST', '0.0.0.0');
  const grpcPort = configService.get('GRPC_PORT', '5000');
  const httpPort = configService.get('PORT', '3000');
  
  // Connect the gRPC microservice to the application
  // This allows the app to handle incoming gRPC calls from Service B
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,  // Specify that we're using gRPC
    options: {
      package: 'todo',  // The package name defined in the proto file
      protoPath: join(__dirname, './grpc/proto/todo.proto'),  // Path to the proto file
      url: `${grpcHost}:${grpcPort}`,  // The address where gRPC server will listen
    },
  });

  // Start both the HTTP and gRPC servers
  // startAllMicroservices() starts the gRPC server
  await app.startAllMicroservices();
  
  // app.listen() starts the HTTP server for REST API
  await app.listen(httpPort);
  
  logger.log(`todo-service-a REST API is running on: http://localhost:${httpPort}`);
  logger.log(`todo-service-a gRPC server is running on: ${grpcHost}:${grpcPort}`);
}

bootstrap();