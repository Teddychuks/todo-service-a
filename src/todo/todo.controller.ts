// src/todo/todo.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Logger, ValidationPipe } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Controller('todos')
export class TodoController {
  private readonly logger = new Logger(TodoController.name);

  constructor(private readonly todoService: TodoService) {}

  @Post()
  async create(@Body(ValidationPipe) createTodoDto: CreateTodoDto) {
    this.logger.log(`Received REST request to create todo: ${JSON.stringify(createTodoDto)}`);
    
    try {
      // This will forward the request to service-b via gRPC
      const result = await this.todoService.create(createTodoDto);
      this.logger.log(`Todo created with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error creating todo: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to create todo',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async findAll() {
    this.logger.log('Received REST request to get all todos');
    
    try {
      const result = await this.todoService.findAll();
      this.logger.log(`Retrieved ${result.length} todos`);
      return result;
    } catch (error) {
      this.logger.error(`Error getting todos: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get todos',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const todoId = +id;
    this.logger.log(`Received REST request to get todo with ID: ${todoId}`);
    
    try {
      const result = await this.todoService.findOne(todoId);
      this.logger.log(`Retrieved todo with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error getting todo with ID ${todoId}: ${error.message}`);
      throw new HttpException(
        error.message || `Failed to get todo with ID ${todoId}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body(ValidationPipe) updateTodoDto: UpdateTodoDto) {
    const todoId = +id;
    this.logger.log(`Received REST request to update todo with ID ${todoId}: ${JSON.stringify(updateTodoDto)}`);
    
    try {
      const result = await this.todoService.update(todoId, updateTodoDto);
      this.logger.log(`Updated todo with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating todo with ID ${todoId}: ${error.message}`);
      throw new HttpException(
        error.message || `Failed to update todo with ID ${todoId}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const todoId = +id;
    this.logger.log(`Received REST request to delete todo with ID: ${todoId}`);
    
    try {
      const result = await this.todoService.remove(todoId);
      this.logger.log(`Delete result for todo ID ${todoId}: ${result.success}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deleting todo with ID ${todoId}: ${error.message}`);
      throw new HttpException(
        error.message || `Failed to delete todo with ID ${todoId}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}