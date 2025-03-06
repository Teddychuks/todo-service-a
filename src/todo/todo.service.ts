import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { RemoteTodoService } from './remote-todo.service';
import { CreateTodoDto, UpdateTodoDto } from '../proto/todo';

@Injectable()
export class TodoService {
  private readonly logger = new Logger('TodoService-A');

  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
    private remoteTodoService: RemoteTodoService
  ) {}

  async findAll(): Promise<Todo[]> {
    this.logger.log('Finding all todos from Service A');
    return this.todoRepository.find();
  }

  async findOne(id: string): Promise<Todo | null> {
    this.logger.log(`Finding todo with id ${id} from Service A`);
    return this.todoRepository.findOne({ 
      where: { id: parseInt(id) } 
    });
  }

  async create(data: CreateTodoDto): Promise<Todo> {
    this.logger.log(`Creating todo in Service A: ${JSON.stringify(data)}`);
    
    const todo = this.todoRepository.create({
      title: data.title,
    });
    
    return this.todoRepository.save(todo);
  }

  async createInServiceB(data: CreateTodoDto): Promise<any> {
    this.logger.log(`Requesting to create todo in Service B: ${JSON.stringify(data)}`);
    try {
      return await this.remoteTodoService.createInRemoteService(data);
    } catch (error) {
      this.logger.error(`Error creating todo in Service B: ${error.message}`);
      throw error;
    }
  }

  async findAllFromServiceB(): Promise<any> {
    this.logger.log('Requesting todos from Service B');
    try {
      return await this.remoteTodoService.findAllFromRemoteService();
    } catch (error) {
      this.logger.error(`Error fetching todos from Service B: ${error.message}`);
      return { todos: [] }; // Return empty array on error
    }
  }
  
  async findOneFromServiceB(id: string): Promise<any> {
    this.logger.log(`Requesting todo with id ${id} from Service B`);
    try {
      return await this.remoteTodoService.findOneFromRemoteService(id);
    } catch (error) {
      this.logger.error(`Error fetching todo with id ${id} from Service B: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, data: Partial<UpdateTodoDto>): Promise<Todo | null> {
    this.logger.log(`Updating todo with id ${id} in Service A`);
    await this.todoRepository.update(parseInt(id), {
      title: data.title,
      completed: data.completed,
    });
    
    return this.todoRepository.findOne({ where: { id: parseInt(id) } });
  }
  
  async updateInServiceB(id: string, data: Partial<UpdateTodoDto>): Promise<any> {
    this.logger.log(`Requesting to update todo with id ${id} in Service B`);
    try {
      return await this.remoteTodoService.updateInRemoteService({
        id,
        title: data.title || '',
        completed: data.completed ?? false
      });
    } catch (error) {
      this.logger.error(`Error updating todo with id ${id} in Service B: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`Removing todo with id ${id} from Service A`);
    await this.todoRepository.delete(parseInt(id));
  }
  
  async removeFromServiceB(id: string): Promise<void> {
    this.logger.log(`Requesting to remove todo with id ${id} from Service B`);
    try {
      await this.remoteTodoService.removeFromRemoteService(id);
    } catch (error) {
      this.logger.error(`Error removing todo with id ${id} from Service B: ${error.message}`);
      throw error;
    }
  }
}