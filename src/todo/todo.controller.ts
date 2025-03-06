import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { 
  TodoList, 
  Empty, 
  TodoById, 
  CreateTodoDto, 
  UpdateTodoDto 
} from '../proto/todo';

@Controller()
export class TodoController {
  private readonly logger = new Logger('TodoController-A');

  constructor(private readonly todoService: TodoService) {}

  @GrpcMethod('TodoService', 'FindAll')
  async findAll(data: Empty): Promise<TodoList> {
    this.logger.log('gRPC FindAll called on Service A');
    const todos = await this.todoService.findAll();
    return {
      todos: todos.map((todo: Todo) => todo.toGrpc()),
    };
  }

  @GrpcMethod('TodoService', 'FindOne')
  async findOne(data: TodoById): Promise<any> {
    this.logger.log(`gRPC FindOne called on Service A with ID: ${data.id}`);
    const todo = await this.todoService.findOne(data.id);
    if (!todo) {
      throw new Error(`Todo with ID ${data.id} not found`);
    }
    return todo.toGrpc();
  }

  @GrpcMethod('TodoService', 'Create')
  async create(data: CreateTodoDto): Promise<any> {
    this.logger.log(`gRPC Create called on Service A with data: ${JSON.stringify(data)}`);
    const todo = await this.todoService.create(data);
    return todo.toGrpc();
  }

  @GrpcMethod('TodoService', 'Update')
  async update(data: UpdateTodoDto): Promise<any> {
    this.logger.log(`gRPC Update called on Service A for ID: ${data.id}`);
    const todo = await this.todoService.update(data.id, data);
    if (!todo) {
      throw new Error(`Todo with ID ${data.id} not found`);
    }
    return todo.toGrpc();
  }

  @GrpcMethod('TodoService', 'Remove')
  async remove(data: TodoById): Promise<Empty> {
    this.logger.log(`gRPC Remove called on Service A for ID: ${data.id}`);
    await this.todoService.remove(data.id);
    return {};
  }
}