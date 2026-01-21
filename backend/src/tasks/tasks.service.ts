import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Between } from 'typeorm';
import { Task } from './entities/task.entity';
import { FocusSession } from './entities/focus-session.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WearSessionDto } from './dto/wear-session.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(FocusSession)
    private readonly focusSessionRepository: Repository<FocusSession>,
  ) { }

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      userId,
      scheduledDate: createTaskDto.scheduledDate || null,
    });
    return this.taskRepository.save(task);
  }

  async findAll(userId: string, date?: string): Promise<Task[]> {
    if (date) {
      const tasks = await this.taskRepository.find({
        where: { userId, scheduledDate: date },
        order: { createdAt: 'ASC' },
        relations: ['focusSessions'],
      });
      return tasks.map(task => this.calculateActualDuration(task));
    }
    const tasks = await this.taskRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
      relations: ['focusSessions'],
    });
    return tasks.map(task => this.calculateActualDuration(task));
  }

  // Helper to sync actualDuration from FocusSessions at runtime
  private calculateActualDuration(task: Task): Task {
    if (task.focusSessions && task.focusSessions.length > 0) {
      const sessionDuration = task.focusSessions.reduce((acc, session) => acc + session.duration, 0);
      // Prioritize session duration if logic requires, or sync them.
      // Here we allow FocusSession to be the source of truth if it exists.
      if (sessionDuration > (task.actualDuration || 0)) {
        task.actualDuration = sessionDuration;
      }
    }
    return task;
  }

  async findBrainDump(userId: string): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: { userId, scheduledDate: IsNull() },
      order: { createdAt: 'ASC' },
      relations: ['focusSessions'],
    });
    return tasks.map(task => this.calculateActualDuration(task));
  }

  async findWeek(userId: string, startDate: string): Promise<Task[]> {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const endDate = end.toISOString().split('T')[0];

    const tasks = await this.taskRepository.find({
      where: {
        userId,
        scheduledDate: Between(startDate, endDate),
      },
      order: { scheduledDate: 'ASC', createdAt: 'ASC' },
      relations: ['focusSessions'],
    });
    return tasks.map(task => this.calculateActualDuration(task));
  }

  async findOne(userId: string, id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['focusSessions']
    });
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
    if (task.userId !== userId) {
      throw new ForbiddenException('You do not have access to this task');
    }
    return this.calculateActualDuration(task);
  }

  async update(userId: string, id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(userId, id);
    Object.assign(task, updateTaskDto);
    return this.taskRepository.save(task);
  }

  async remove(userId: string, id: string): Promise<void> {
    const task = await this.findOne(userId, id);
    await this.taskRepository.remove(task);
  }

  // Wear OS session sync - saved as FocusSession (Action) instead of Task (Plan)
  async syncWearSession(userId: string, wearSession: WearSessionDto): Promise<Task | null> {
    const startDate = new Date(wearSession.startTimeMillis);
    const endDate = new Date(wearSession.endTimeMillis > 0 ? wearSession.endTimeMillis : wearSession.startTimeMillis + wearSession.durationMinutes * 60000);

    // Find linked task if exists
    let task: Task | null = null;
    if (wearSession.taskId) {
      task = await this.taskRepository.findOne({ where: { id: wearSession.taskId, userId } });
    }

    // [New Logic] Check for potential duplication (overlapping session within 2 minutes)
    // This prevents "Ghost Tasks" if the phone has already recorded this session.
    const overlapWindowMs = 2 * 60 * 1000; // 2 minutes
    const existingSession = await this.focusSessionRepository.findOne({
      where: {
        userId,
        startTime: Between(
          new Date(startDate.getTime() - overlapWindowMs),
          new Date(startDate.getTime() + overlapWindowMs)
        ),
      },
      relations: ['task'],
    });

    if (existingSession) {
      console.log('Duplicate session detected, skipping creation or linking.');
      // Optionally link if we found a task but the session was unlinked?
      // For now, assume if session exists, we are good. return the existing task if any.
      return existingSession.task || null;
    }

    // If no task found AND no duplicate session, create a new "Inbox" Task
    // This handles "Watch-only" sessions (User started timer on watch without picking a task)
    if (!task) {
      const startTimeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
      const scheduledDate = startDate.toISOString().split('T')[0];

      task = this.taskRepository.create({
        userId,
        title: wearSession.title || `Watch Session ${startTimeStr}`,
        scheduledDate, // Put it on today's schedule
        startTime: startTimeStr,
        isCompleted: false,
        timerStartedAt: startDate,
      });
      await this.taskRepository.save(task);
    }

    // Create FocusSession
    const session = this.focusSessionRepository.create({
      userId,
      task: task,
      taskId: task.id,
      startTime: startDate,
      endTime: endDate,
      duration: wearSession.durationMinutes,
      memo: wearSession.title || 'Watch Session',
    });

    await this.focusSessionRepository.save(session);

    // Update Legacy actualDuration for frontend compatibility
    // Now task is guaranteed to exist (either found or created)
    if (task) {
      task.actualDuration = (task.actualDuration || 0) + wearSession.durationMinutes;
      await this.taskRepository.save(task);
    }

    return task;
  }
}
