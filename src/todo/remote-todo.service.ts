import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Observable, firstValueFrom } from 'rxjs';

interface TodoService {
  create(data: CreateTodoDto): Observable<Todo>;
  findAll(data: {}): Observable<TodoList>;
  findOne(data: {id: number}): Observable<Todo>;
  update(data: UpdateTodoDto): Observable<Todo>;
  remove(data: {id: number}): Observable<{}>;
}

interface CreateTodoDto {
  title: string;
  description: string;
}

interface UpdateTodoDto {
  id: number;
  title?: string;
  description?: string;
  completed?: boolean;
}

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  service_name: string;
  created_at: string;
  updated_at: string;
}

interface TodoList {
  todos: Todo[];
}

@Injectable()
export class RemoteTodoService implements OnModuleInit {
  private readonly logger = new Logger('RemoteTodoService-A');
  private todoService: TodoService;

  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'todo',
      protoPath: join(__dirname, '../proto/todo.proto'),
      url: process.env.REMOTE_SERVICE_URL || 'localhost:5002', // Todo Service B
    },
  })
  private client: ClientGrpc;

  onModuleInit() {
    this.todoService = this.client.getService<TodoService>('TodoService');
    this.logger.log('Remote Todo client initialized for Service B');
  }

  async createInRemoteService(data: CreateTodoDto): Promise<Todo> {
    this.logger.log(`Creating todo in Service B: ${JSON.stringify(data)}`);
    return firstValueFrom(this.todoService.create(data));
  }

  async findAllFromRemoteService(): Promise<Todo[]> {
    this.logger.log('Fetching todos from Service B');
    const response = await firstValueFrom(this.todoService.findAll({}));
    return response.todos;
  }
  
  async findOneFromRemoteService(id: number): Promise<Todo> {
    this.logger.log(`Fetching todo with id ${id} from Service B`);
    return firstValueFrom(this.todoService.findOne({id}));
  }
  
  async updateInRemoteService(data: UpdateTodoDto): Promise<Todo> {
    this.logger.log(`Updating todo in Service B: ${JSON.stringify(data)}`);
    return firstValueFrom(this.todoService.update(data));
  }
  
  async removeFromRemoteService(id: number): Promise<void> {
    this.logger.log(`Removing todo with id ${id} from Service B`);
    await firstValueFrom(this.todoService.remove({id}));
  }
}