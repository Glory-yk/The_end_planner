# Railway 배포를 위한 백엔드 변경 사항 가이드 (워치 단독 사용 지원)

사용자 요청에 따라 Railway 배포를 위해 백엔드에 추가/수정해야 할 파일들의 전체 코드를 제공합니다.
이 코드는 **태스크 지정 없이 워치에서 단독으로 실행한 타이머**도 플래너에 저장되도록 수정되었습니다.

---

## 2. 기존 파일 수정

### 2-1. `backend/src/tasks/tasks.service.ts` (워치 단독 사용 지원)
**중복 체크 기능**이 추가되어, 폰 실행 기록과 워치 실행 기록이 겹칠 때는 중복 저장을 방지하고, **워치 단독 실행 시에는 새 태스크**를 만들어줍니다.

```typescript
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

  // Wear OS session sync
  async syncWearSession(userId: string, wearSession: WearSessionDto): Promise<Task | null> {
    const startDate = new Date(wearSession.startTimeMillis);
    const endDate = new Date(wearSession.endTimeMillis > 0 ? wearSession.endTimeMillis : wearSession.startTimeMillis + wearSession.durationMinutes * 60000);
    
    // 1. Find linked task if exists
    let task: Task | null = null;
    if (wearSession.taskId) {
      task = await this.taskRepository.findOne({ where: { id: wearSession.taskId, userId } });
    }

    // 2. Check for duplicate session (prevent Ghost Task if already synced)
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
      console.log('Duplicate session detected, skipping creation.');
      return existingSession.task || null;
    }

    // 3. If "Watch Only" session (no task & no duplicate), Create New Task
    if (!task) {
      const startTimeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
      const scheduledDate = startDate.toISOString().split('T')[0];
      
      task = this.taskRepository.create({
        userId,
        title: wearSession.title || `Watch Session ${startTimeStr}`,
        scheduledDate,
        startTime: startTimeStr,
        isCompleted: false,
        timerStartedAt: startDate,
      });
      await this.taskRepository.save(task);
    }

    // 4. Create FocusSession
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

    // 5. Update Legacy actualDuration
    if (task) {
      task.actualDuration = (task.actualDuration || 0) + wearSession.durationMinutes;
      await this.taskRepository.save(task);
    }

    return task; 
  }
}
```

---

## 3. 적용 방법

이 파일을 Railway에 반영(Git Push)해 주세요.
