// src/todo/todo.service.ts
import { Injectable, Logger, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from '../entity/todo.entity';
import { TodoGrpcClient } from '../grpc/todo.client';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoResponseDto } from './dto/todo-response.dto';
import {
  CreateTodoRequest,
  TodoResponse,
  UpdateTodoRequest
} from '../grpc/interfaces/todo.interface';

@Injectable()
export class TodoService {
  private readonly logger = new Logger(TodoService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
    private readonly todoGrpcClient: TodoGrpcClient
  ) {}

  // Methods for handling REST API requests that forward to todo-service-b via gRPC
  
  async create(createTodoDto: CreateTodoDto): Promise<TodoResponseDto> {
    this.logger.log(`Forwarding create todo request to service-b: ${JSON.stringify(createTodoDto)}`);
    
    try {
      // Explicit conversion from REST DTO to gRPC format
      const grpcRequest = this.mapToGrpcCreateRequest(createTodoDto);
      
      // Send to service B via gRPC
      const grpcResponse = await this.todoGrpcClient.createTodo(grpcRequest);
      
      // Convert gRPC response back to REST DTO
      return this.mapFromGrpcResponse(grpcResponse);
    } catch (error) {
      this.logger.error(`Error forwarding create todo request: ${error.message}`);
      throw new HttpException(
        'Failed to create todo via service B',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAll(): Promise<TodoResponseDto[]> {
    this.logger.log('Forwarding get all todos request to service-b');
    
    try {
      // Get all todos from todo-service-b via gRPC
      const response = await this.todoGrpcClient.getTodos();
      
      // Convert gRPC responses to REST DTOs
      return response.todos.map(todo => this.mapFromGrpcResponse(todo));
    } catch (error) {
      this.logger.error(`Error forwarding get all todos request: ${error.message}`);
      throw new HttpException(
        'Failed to get todos from service B',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: number): Promise<TodoResponseDto> {
    this.logger.log(`Forwarding get todo request for ID ${id} to service-b`);
    
    try {
      // Get a single todo from todo-service-b via gRPC
      const grpcResponse = await this.todoGrpcClient.getTodoById(id);
      
      // Convert gRPC response to REST DTO
      return this.mapFromGrpcResponse(grpcResponse);
    } catch (error) {
      this.logger.error(`Error forwarding get todo request for ID ${id}: ${error.message}`);
      throw new HttpException(
        `Failed to get todo with ID ${id} from service B`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<TodoResponseDto> {
    this.logger.log(`Forwarding update todo request for ID ${id} to service-b: ${JSON.stringify(updateTodoDto)}`);
    
    try {
      // Convert DTO to gRPC format
      const grpcRequest = this.mapToGrpcUpdateRequest(id, updateTodoDto);
      
      // Send to service B via gRPC
      const grpcResponse = await this.todoGrpcClient.updateTodo(grpcRequest);
      
      // Convert gRPC response to REST DTO
      return this.mapFromGrpcResponse(grpcResponse);
    } catch (error) {
      this.logger.error(`Error forwarding update todo request for ID ${id}: ${error.message}`);
      throw new HttpException(
        `Failed to update todo with ID ${id} in service B`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async remove(id: number): Promise<{ success: boolean }> {
    this.logger.log(`Forwarding delete todo request for ID ${id} to service-b`);
    
    try {
      // Delete a todo via todo-service-b gRPC
      const response = await this.todoGrpcClient.deleteTodo(id);
      return { success: response.success };
    } catch (error) {
      this.logger.error(`Error forwarding delete todo request for ID ${id}: ${error.message}`);
      throw new HttpException(
        `Failed to delete todo with ID ${id} from service B`,
        error.message.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Methods for handling gRPC requests directly in todo-service-a's database
  
  async createTodoInOwnDatabase(data: CreateTodoRequest): Promise<Todo> {
    this.logger.log(`Creating todo in service-a database: ${JSON.stringify(data)}`);
    
    // Create a todo directly in service-a's database
    const todo = new Todo();
    todo.title = data.title;
    todo.completed = data.completed;
    
    try {
      return await this.todoRepository.save(todo);
    } catch (error) {
      this.logger.error(`Error creating todo in service-a database: ${error.message}`);
      throw error;
    }
  }

  async findAllInOwnDatabase(): Promise<{ todos: Todo[] }> {
    this.logger.log('Finding all todos in service-a database');
    
    try {
      const todos = await this.todoRepository.find();
      return { todos };
    } catch (error) {
      this.logger.error(`Error finding all todos in service-a database: ${error.message}`);
      throw error;
    }
  }

  async findOneInOwnDatabase(id: number): Promise<Todo> {
    this.logger.log(`Finding todo with ID ${id} in service-a database`);
    
    try {
      const todo = await this.todoRepository.findOne({ where: { id } });
      
      if (!todo) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }
      
      return todo;
    } catch (error) {
      this.logger.error(`Error finding todo with ID ${id} in service-a database: ${error.message}`);
      throw error;
    }
  }

  async updateInOwnDatabase(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    this.logger.log(`Updating todo with ID ${id} in service-a database: ${JSON.stringify(updateTodoDto)}`);
    
    try {
      const todo = await this.todoRepository.findOne({ where: { id } });
      
      if (!todo) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }
      
      if (updateTodoDto.title !== undefined) {
        todo.title = updateTodoDto.title;
      }
      
      if (updateTodoDto.completed !== undefined) {
        todo.completed = updateTodoDto.completed;
      }
      
      return await this.todoRepository.save(todo);
    } catch (error) {
      this.logger.error(`Error updating todo with ID ${id} in service-a database: ${error.message}`);
      throw error;
    }
  }

  async removeFromOwnDatabase(id: number): Promise<{ success: boolean }> {
    this.logger.log(`Removing todo with ID ${id} from service-a database`);
    
    try {
      const todo = await this.todoRepository.findOne({ where: { id } });
      
      if (!todo) {
        throw new NotFoundException(`Todo with ID ${id} not found`);
      }
      
      await this.todoRepository.delete(id);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error removing todo with ID ${id} from service-a database: ${error.message}`);
      throw error;
    }
  }

  
  private mapToGrpcCreateRequest(dto: CreateTodoDto): CreateTodoRequest {
    return {
      title: dto.title,
      completed: dto.completed || false
    };
  }
  
private mapToGrpcUpdateRequest(id: number, dto: UpdateTodoDto): UpdateTodoRequest {
  return {
    id,
    title: dto.title || '',  
    completed: dto.completed !== undefined ? dto.completed : false  
  };
}
  
  private mapFromGrpcResponse(response: TodoResponse): TodoResponseDto {
    return {
      id: response.id,
      title: response.title,
      completed: response.completed
    };
  }
}