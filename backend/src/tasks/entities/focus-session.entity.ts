import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('focus_sessions')
export class FocusSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    // Nullable because a session might not be assigned to a task yet (Unplanned Action)
    @Column({ nullable: true })
    taskId: string | null;

    @ManyToOne(() => Task, (task) => task.focusSessions, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'taskId' })
    task: Task | null;

    @Column({ type: 'timestamp' })
    startTime: Date;

    @Column({ type: 'timestamp' })
    endTime: Date;

    @Column({ type: 'int' })
    duration: number; // in minutes

    @Column({ type: 'text', nullable: true })
    memo: string | null; // Optional user memo for this session

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
