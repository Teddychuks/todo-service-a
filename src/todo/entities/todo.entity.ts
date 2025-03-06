import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  @Column({ default: false })
  completed: boolean;

  toGrpc() {
    return {
      id: this.id,
      title: this.title,
      completed: this.completed,
    };
  }
}