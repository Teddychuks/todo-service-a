import { Controller, } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Todo } from './entities/todo.entity';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateTodoDto, Empty, TodoById, UpdateTodoDto, Todo as ProtoTodo, TodoList } from '../proto/todo';
import { Metadata } from '@grpc/grpc-js';

@Controller('todos')
export class TodoController {
    constructor(private readonly todoService: TodoService) {}

    // GRPC Methods
    @GrpcMethod('TodoService', 'Create')
    async create(data: CreateTodoDto, metadata: Metadata): Promise<ProtoTodo> {
        const isRemote = metadata.get('remote');
        const todo = isRemote && isRemote[0] 
            ? await this.todoService.createInServiceB(data)
            : await this.todoService.create(data);
        
        return { 
            id: todo.id.toString(), 
            title: todo.title, 
            completed: todo.completed 
        };
    }

    @GrpcMethod('TodoService', 'FindAll')
    async findAll(_: Empty, metadata: Metadata): Promise<TodoList> {
        const isRemote = metadata.get('remote');
        const todos = isRemote && isRemote[0]
            ? await this.todoService.findAllFromServiceB()
            : await this.todoService.findAll();
        
        return { 
            todos: Array.isArray(todos) 
                ? todos.map((todo: Todo): ProtoTodo => ({ 
                    id: todo.id.toString(), 
                    title: todo.title, 
                    completed: todo.completed 
                  }))
                : []
        };
    }

    @GrpcMethod('TodoService', 'FindOne')
    async findOne(data: TodoById, metadata: Metadata): Promise<ProtoTodo> {
        const isRemote = metadata.get('remote');
        const todo = isRemote && isRemote[0]
            ? await this.todoService.findOneFromServiceB(data.id)
            : await this.todoService.findOne(data.id);
        
        if (!todo) {
            throw new Error(`Todo with ID ${data.id} not found`);
        }
        
        return { 
            id: todo.id.toString(), 
            title: todo.title, 
            completed: todo.completed 
        };
    }

    @GrpcMethod('TodoService', 'Update')
    async update(data: UpdateTodoDto, metadata: Metadata): Promise<ProtoTodo | Empty> {
        const isRemote = metadata.get('remote');
        const result = isRemote && isRemote[0]
            ? await this.todoService.updateInServiceB(data.id, data)
            : await this.todoService.update(data.id, data);
        
        if (!result) {
            return {};
        }
        
        return { 
            id: result.id.toString(), 
            title: result.title, 
            completed: result.completed 
        };
    }

    @GrpcMethod('TodoService', 'Remove')
    async remove(data: TodoById, metadata: Metadata): Promise<Empty> {
        const isRemote = metadata.get('remote');
        
        if (isRemote && isRemote[0]) {
            await this.todoService.removeFromServiceB(data.id);
        } else {
            await this.todoService.remove(data.id);
        }
        
        return {};
    }
}