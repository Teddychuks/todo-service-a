import { Observable } from "rxjs";

// src/grpc/interfaces/todo.interface.ts
export interface TodoById {
  id: number;
}

export interface Empty {}

export interface CreateTodoRequest {
  title: string;
  completed: boolean;
}

export interface UpdateTodoRequest {
  id: number;
  title: string;
  completed: boolean;
}

export interface TodoResponse {
  id: number;
  title: string;
  completed: boolean;
}

export interface TodosResponse {
  todos: TodoResponse[];
}

export interface DeleteResponse {
  success: boolean;
}

export interface TodoService {
  createTodo(data: CreateTodoRequest): Observable<TodoResponse>;
  getTodos(data: Empty): Observable<TodosResponse>;
  getTodoById(data: TodoById): Observable<TodoResponse>;
  updateTodo(data: UpdateTodoRequest): Observable<TodoResponse>;
  deleteTodo(data: TodoById): Observable<DeleteResponse>;
}