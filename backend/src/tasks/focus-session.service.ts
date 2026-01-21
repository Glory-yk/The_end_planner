import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, IsNull } from 'typeorm';
import { FocusSession } from './entities/focus-session.entity';
import { Task } from './entities/task.entity';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { UpdateFocusSessionDto } from './dto/update-focus-session.dto';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class FocusSessionService {
    constructor(
        @InjectRepository(FocusSession)
        private sessionRepository: Repository<FocusSession>,
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
    ) { }

    async create(createDto: CreateFocusSessionDto, user: User): Promise<FocusSession> {
        const session = this.sessionRepository.create({
            ...createDto,
            user,
            startTime: new Date(createDto.startTime),
            endTime: new Date(createDto.endTime),
        });

        if (createDto.taskId) {
            const task = await this.taskRepository.findOne({
                where: { id: createDto.taskId, userId: user.id },
            });
            if (!task) {
                throw new NotFoundException('Task not found');
            }
            session.task = task;
        }

        return this.sessionRepository.save(session);
    }

    async findAll(user: User, startDate: string, endDate: string) {
        // Find sessions within date range
        return this.sessionRepository.find({
            where: {
                userId: user.id,
                startTime: Between(new Date(startDate), new Date(endDate)),
            },
            relations: ['task'], // Include linked task info
            order: { startTime: 'ASC' },
        });
    }

    async findUnassigned(user: User) {
        return this.sessionRepository.find({
            where: {
                userId: user.id,
                task: IsNull(),
            },
            order: { startTime: 'DESC' },
        });
    }

    async linkToTask(id: string, updateDto: UpdateFocusSessionDto, user: User) {
        const session = await this.sessionRepository.findOne({
            where: { id, userId: user.id },
        });
        if (!session) {
            throw new NotFoundException('Session not found');
        }

        if (updateDto.taskId) {
            const task = await this.taskRepository.findOne({
                where: { id: updateDto.taskId, userId: user.id },
            });
            if (!task) {
                throw new NotFoundException('Task not found');
            }
            session.task = task;
            session.taskId = task.id;
        }

        if (updateDto.memo) {
            session.memo = updateDto.memo;
        }

        return this.sessionRepository.save(session);
    }
}
