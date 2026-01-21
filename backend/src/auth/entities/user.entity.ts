import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  googleId: string;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  picture: string | null;

  // Google OAuth tokens for Calendar API
  @Column({ nullable: true, type: 'text' })
  googleAccessToken: string | null;

  @Column({ nullable: true, type: 'text' })
  googleRefreshToken: string | null;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

