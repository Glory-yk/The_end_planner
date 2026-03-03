import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Query,
    Request,
    UseGuards,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarService } from './calendar.service';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) { }

    /**
     * Get calendar events for a date range
     * GET /calendar/events?timeMin=...&timeMax=...
     */
    @Get('events')
    async getEvents(
        @Request() req: { user: { id: string } },
        @Query('timeMin') timeMin: string,
        @Query('timeMax') timeMax: string,
    ) {
        try {
            const now = new Date();
            const defaultTimeMin = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const defaultTimeMax = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

            const events = await this.calendarService.getEvents(
                req.user.id,
                timeMin || defaultTimeMin,
                timeMax || defaultTimeMax,
            );
            return { events };
        } catch (error: any) {
            console.error('Failed to get calendar events:', error);
            if (error.message?.includes('Token expired')) {
                throw new HttpException(
                    'Google re-authentication required',
                    HttpStatus.UNAUTHORIZED,
                );
            }
            throw new HttpException(
                'Failed to fetch calendar events',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Sync all tasks to Google Calendar
     * POST /calendar/sync
     */
    @Post('sync')
    async syncTasks(@Request() req: { user: { id: string } }) {
        try {
            const result = await this.calendarService.syncAllTasks(req.user.id);
            return { message: 'Calendar sync completed', ...result };
        } catch (error) {
            console.error('Failed to sync to calendar:', error);
            throw new HttpException(
                'Failed to sync to calendar',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Sync a single task to Google Calendar (with reminders)
     * POST /calendar/sync-task
     */
    @Post('sync-task')
    async syncSingleTask(
        @Request() req: { user: { id: string } },
        @Body() body: { taskId: string },
    ) {
        try {
            const result = await this.calendarService.syncSingleTask(req.user.id, body.taskId);
            return { message: '캘린더에 성공적으로 등록되었습니다', ...result };
        } catch (error: any) {
            console.error('Failed to sync single task:', error);
            if (error.message?.includes('no scheduled date')) {
                throw new HttpException(
                    '날짜가 설정된 태스크만 캘린더에 등록할 수 있습니다',
                    HttpStatus.BAD_REQUEST,
                );
            }
            if (error.message?.includes('No Google access token')) {
                throw new HttpException(
                    '구글 계정으로 로그인해야 캘린더를 사용할 수 있습니다',
                    HttpStatus.FORBIDDEN,
                );
            }
            throw new HttpException(
                error.message || 'Failed to sync task',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    /**
     * Sync all tasks of a project to Google Calendar
     * POST /calendar/sync-project/:projectId
     */
    @Post('sync-project/:projectId')
    async syncProjectTasks(
        @Request() req: { user: { id: string } },
        @Param('projectId') projectId: string,
    ) {
        try {
            const result = await this.calendarService.syncProjectTasks(req.user.id, projectId);
            return {
                message: `프로젝트 태스크 캘린더 동기화 완료 (성공: ${result.synced}, 실패: ${result.failed})`,
                ...result,
            };
        } catch (error: any) {
            console.error('Failed to sync project tasks:', error);
            if (error.message?.includes('No Google access token')) {
                throw new HttpException(
                    '구글 계정으로 로그인해야 캘린더를 사용할 수 있습니다',
                    HttpStatus.FORBIDDEN,
                );
            }
            throw new HttpException(
                'Failed to sync project tasks',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
