import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { RemoteTodoService } from './remote-todo.service';

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

  async findOne(id: number): Promise<Todo | null> {
    this.logger.log(`Finding todo with id ${id} from Service A`);
    return this.todoRepository.findOne({ where: { id } });
  }

  async create(data: any): Promise<Todo> {
    this.logger.log(`Creating todo in Service A: ${JSON.stringify(data)}`);
    
    const todo = this.todoRepository.create({
      title: data.title,
      description: data.description,
      serviceName: 'service-a'
    });
    
    return this.todoRepository.save(todo);
  }

  async createInServiceB(data: any): Promise<any> {
    this.logger.log(`Requesting to create todo in Service B: ${JSON.stringify(data)}`);
    return this.remoteTodoService.createInRemoteService(data);
  }

  async findAllFromServiceB(): Promise<any[]> {
    this.logger.log('Requesting todos from Service B');
    return this.remoteTodoService.findAllFromRemoteService();
  }
  
  async findOneFromServiceB(id: number): Promise<any> {
    this.logger.log(`Requesting todo with id ${id} from Service B`);
    return this.remoteTodoService.findOneFromRemoteService(id);
  }

  async update(id: number, data: any): Promise<Todo | null> {
    this.logger.log(`Updating todo with id ${id} in Service A`);
    await this.todoRepository.update(id, {
      title: data.title,
      description: data.description,
      completed: data.completed,
    });
    
    return this.todoRepository.findOne({ where: { id } });
  }
  
  async updateInServiceB(id: number, data: any): Promise<any> {
    this.logger.log(`Requesting to update todo with id ${id} in Service B`);
    return this.remoteTodoService.updateInRemoteService({
      id,
      ...data
    });
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing todo with id ${id} from Service A`);
    await this.todoRepository.delete(id);
  }
  
  async removeFromServiceB(id: number): Promise<void> {
    this.logger.log(`Requesting to remove todo with id ${id} from Service B`);
    await this.remoteTodoService.removeFromRemoteService(id);
  }
}