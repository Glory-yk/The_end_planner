import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { FocusSession } from './focus-session.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: false })
  isCompleted: boolean;

  @Column({ type: 'date', nullable: true })
  scheduledDate: string | null;

  // Schedule fields
  @Column({ type: 'varchar', length: 5, nullable: true })
  startTime: string | null; // 'HH:mm' format

  @Column({ type: 'int', nullable: true })
  duration: number | null; // planned duration in minutes

  // Timer tracking fields
  @Column({ type: 'int', nullable: true })
  actualDuration: number | null; // actual duration in minutes (measured by timer)

  @Column({ type: 'timestamp', nullable: true })
  timerStartedAt: Date | null; // when timer was started

  // Mandalart integration
  @Column({ type: 'int', nullable: true })
  mandalartGridIndex: number | null; // which sub-grid (0-8)

  @Column({ type: 'int', nullable: true })
  mandalartCellIndex: number | null; // which cell within grid (0-8)

  // Plan-Action Separation: One Task can have multiple Focus Sessions
  @OneToMany(() => FocusSession, (session) => session.task)
  focusSessions: FocusSession[];

  // Google Calendar Integration
  @Column({ type: 'varchar', nullable: true })
  googleEventId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
