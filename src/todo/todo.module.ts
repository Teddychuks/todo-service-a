// src/todo/todo.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { TodoGrpcClient } from '../grpc/todo.client';
import { TodoGrpcController } from '../grpc/todo.controller';
import { Todo } from '../entity/todo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]),
    
    // Registers gRPC client to connect to todo-service-b
    ClientsModule.register([
      {
        name: 'TODO_SERVICE_B',
        transport: Transport.GRPC,
        options: {
          package: 'todo',
          protoPath: join(__dirname, '../grpc/proto/todo.proto'),
          // url: process.env.SERVICE_B_GRPC_URL || 'localhost:5002',
          url: "172.31.47.223:5002"
        },
      },
    ]),
  ],
  controllers: [TodoController, TodoGrpcController],
  providers: [TodoService, TodoGrpcClient],
})
export class TodoModule {}