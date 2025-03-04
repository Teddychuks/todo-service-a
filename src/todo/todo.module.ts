import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { RemoteTodoService } from './remote-todo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  controllers: [TodoController],
  providers: [TodoService, RemoteTodoService],
})
export class TodoModule {}