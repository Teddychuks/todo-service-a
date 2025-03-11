// src/grpc/todo.client.ts - Fixed Version
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, lastValueFrom } from 'rxjs';
import { Inject } from '@nestjs/common';
import { 
  TodoService, 
  CreateTodoRequest, 
  TodoResponse, 
  Empty, 
  TodosResponse, 
  TodoById, 
  UpdateTodoRequest, 
  DeleteResponse 
} from './interfaces/todo.interface';

@Injectable()
export class TodoGrpcClient implements OnModuleInit {
  private todoService: TodoService;
  private readonly logger = new Logger(TodoGrpcClient.name);

  @Inject('TODO_SERVICE_B') 
  private readonly client: ClientGrpc;

  onModuleInit() {
    // Get the service from the gRPC client
    this.todoService = this.client.getService<TodoService>('TodoService');
    this.logger.log('TodoGrpcClient initialized');
  }

  async createTodo(data: CreateTodoRequest): Promise<TodoResponse> {
    this.logger.log(`Sending CreateTodo gRPC request: ${JSON.stringify(data)}`);
    // The todoService methods return Observables, so we need to convert them to Promises
    return lastValueFrom(this.todoService.createTodo(data));
  }

  async getTodos(): Promise<TodosResponse> {
    this.logger.log('Sending GetTodos gRPC request');
    const empty: Empty = {};
    return lastValueFrom(this.todoService.getTodos(empty));
  }

  async getTodoById(id: number): Promise<TodoResponse> {
    this.logger.log(`Sending GetTodoById gRPC request for ID: ${id}`);
    const request: TodoById = { id };
    return lastValueFrom(this.todoService.getTodoById(request));
  }

  async updateTodo(data: UpdateTodoRequest): Promise<TodoResponse> {
    this.logger.log(`Sending UpdateTodo gRPC request: ${JSON.stringify(data)}`);
    return lastValueFrom(this.todoService.updateTodo(data));
  }

  async deleteTodo(id: number): Promise<DeleteResponse> {
    this.logger.log(`Sending DeleteTodo gRPC request for ID: ${id}`);
    const request: TodoById = { id };
    return lastValueFrom(this.todoService.deleteTodo(request));
  }
}