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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IsArray, IsString } from 'class-validator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WearSessionDto } from './dto/wear-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

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

  @Get('completed/search')
  searchCompleted(@Req() req: any, @Query('q') q?: string) {
    return this.tasksService.searchCompleted(req.user.id, q || '');
  }

  @Get('week')
  findWeek(@Req() req: any, @Query('startDate') startDate: string) {
    return this.tasksService.findWeek(req.user.id, startDate);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.findOne(req.user.id, id);
  }

  // PATCH /tasks/reorder — batch update task priority order
  @Patch('reorder')
  @HttpCode(HttpStatus.NO_CONTENT)
  reorder(@Req() req: any, @Body() body: { ids: string[] }) {
    return this.tasksService.reorder(req.user.id, body.ids || []);
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

  // POST /tasks/:id/timer/start
  @Post(':id/timer/start')
  @HttpCode(HttpStatus.OK)
  startTimer(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.startTimer(req.user.id, id);
  }

  // POST /tasks/:id/timer/stop
  @Post(':id/timer/stop')
  @HttpCode(HttpStatus.OK)
  stopTimer(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasksService.stopTimer(req.user.id, id);
  }

  @Post('wear-sync')
  syncWearSession(@Req() req: any, @Body() wearSessionDto: WearSessionDto) {
    return this.tasksService.syncWearSession(req.user.id, wearSessionDto);
  }
}
