import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { User } from '../auth/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Task])],
    controllers: [CalendarController],
    providers: [CalendarService],
    exports: [CalendarService],
})
export class CalendarModule { }
