import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { FocusSession } from './entities/focus-session.entity';
import { FocusSessionController } from './focus-session.controller';
import { FocusSessionService } from './focus-session.service';
import { CalendarModule } from '../calendar/calendar.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, FocusSession]),
    CalendarModule,
  ],
  controllers: [TasksController, FocusSessionController],
  providers: [TasksService, FocusSessionService],
})
export class TasksModule { }
