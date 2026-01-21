import {
    Controller,
    Get,
    Post,
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
            // Default to current month if not provided
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
     * Sync tasks to Google Calendar
     * POST /calendar/sync
     */
    @Post('sync')
    async syncTasks(@Request() req: { user: { id: string } }) {
        try {
            await this.calendarService.syncAllTasks(req.user.id);
            return { message: 'Calendar sync completed' };
        } catch (error) {
            console.error('Failed to sync to calendar:', error);
            throw new HttpException(
                'Failed to sync to calendar',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
