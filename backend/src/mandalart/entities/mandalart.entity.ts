import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

// Todo item structure stored in cellTodos
export interface MandalartTodo {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: string;
  convertedTaskId?: string;
}

// Single grid data structure (9 grids total, each with 9 cells)
export interface MandalartGridData {
  id: number; // 0-8
  title: string;
  cells: string[]; // 9 strings
  linkedTaskIds: string[][]; // 9 arrays
  cellProgress: number[]; // 9 values
  cellTodos: MandalartTodo[][]; // 9 arrays of todos
  subGoalProgress?: number;
  icon?: string;
  cellIcons?: (string | null)[];
}

@Entity('mandalarts')
export class Mandalart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  // Store the entire mandalart data as JSON (9 grids)
  @Column({ type: 'text' })
  data: string; // JSON stringified MandalartGridData[]

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper to get parsed data
  getParsedData(): MandalartGridData[] {
    try {
      return JSON.parse(this.data);
    } catch {
      return [];
    }
  }

  // Helper to set data from object
  setDataFromObject(grids: MandalartGridData[]): void {
    this.data = JSON.stringify(grids);
  }
}
