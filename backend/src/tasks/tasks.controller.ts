import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WearSessionDto } from './dto/wear-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Req() req: any, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.id, createTaskDto);
  }

  @Get()
  findAll(@Req() req: any, @Query('date') date?: string) {
    return this.tasksService.findAll(req.user.id, date);
  }

  @Get('brain-dump')
  findBrainDump(@Req() req: any) {
    return this.tasksService.findBrainDump(req.user.id);
  }

  @Get('week')
  findWeek(@Req() req: any, @Query('startDate') startDate: string) {
    return this.tasksService.findWeek(req.user.id, startDate);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.update(req.user.id, id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.remove(req.user.id, id);
  }

  @Post('wear-sync')
  syncWearSession(@Req() req: any, @Body() wearSessionDto: WearSessionDto) {
    return this.tasksService.syncWearSession(req.user.id, wearSessionDto);
  }
}
