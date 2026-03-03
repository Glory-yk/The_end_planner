import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Task } from '../tasks/entities/task.entity';

export interface CalendarEvent {
    id?: string;
    summary: string;
    description?: string;
    start: {
        dateTime?: string;
        date?: string;
        timeZone?: string;
    };
    end: {
        dateTime?: string;
        date?: string;
        timeZone?: string;
    };
    reminders?: {
        useDefault: boolean;
        overrides?: Array<{ method: string; minutes: number }>;
    };
}

@Injectable()
export class CalendarService {
    private readonly calendarApiUrl = 'https://www.googleapis.com/calendar/v3';

    constructor(
        private configService: ConfigService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Task)
        private taskRepository: Repository<Task>,
    ) { }

    /**
     * Sync all tasks to Google Calendar
     */
    async syncAllTasks(userId: string): Promise<{ synced: number; failed: number }> {
        const tasks = await this.taskRepository.find({
            where: { userId },
            relations: ['project'],
        });
        let synced = 0, failed = 0;
        for (const task of tasks) {
            if (!task.scheduledDate) continue;
            try {
                const eventId = await this.syncTaskToCalendar(userId, {
                    title: task.title,
                    scheduledDate: task.scheduledDate,
                    startTime: task.startTime || undefined,
                    duration: task.duration || undefined,
                    googleEventId: task.googleEventId || undefined,
                    projectName: task.project?.name,
                });
                task.googleEventId = eventId;
                await this.taskRepository.save(task);
                synced++;
            } catch (e) {
                console.error(`Failed to sync task ${task.id}`, e);
                failed++;
            }
        }
        return { synced, failed };
    }

    /**
     * Sync all tasks of a specific project
     */
    async syncProjectTasks(userId: string, projectId: string): Promise<{ synced: number; failed: number }> {
        const tasks = await this.taskRepository.find({
            where: { userId, projectId },
            relations: ['project'],
        });
        let synced = 0, failed = 0;
        for (const task of tasks) {
            if (!task.scheduledDate) continue;
            try {
                const eventId = await this.syncTaskToCalendar(userId, {
                    title: task.title,
                    scheduledDate: task.scheduledDate,
                    startTime: task.startTime || undefined,
                    duration: task.duration || undefined,
                    googleEventId: task.googleEventId || undefined,
                    projectName: task.project?.name,
                });
                task.googleEventId = eventId;
                await this.taskRepository.save(task);
                synced++;
            } catch (e) {
                console.error(`Failed to sync task ${task.id}`, e);
                failed++;
            }
        }
        return { synced, failed };
    }

    /**
     * Sync a single task by taskId
     */
    async syncSingleTask(userId: string, taskId: string): Promise<{ eventId: string }> {
        const task = await this.taskRepository.findOne({
            where: { id: taskId, userId },
            relations: ['project'],
        });
        if (!task) throw new Error('Task not found');
        if (!task.scheduledDate) throw new Error('Task has no scheduled date - please set a date first');

        const eventId = await this.syncTaskToCalendar(userId, {
            title: task.title,
            scheduledDate: task.scheduledDate,
            startTime: task.startTime || undefined,
            duration: task.duration || undefined,
            googleEventId: task.googleEventId || undefined,
            projectName: task.project?.name,
        });
        task.googleEventId = eventId;
        await this.taskRepository.save(task);
        return { eventId };
    }

    /**
     * Get events from Google Calendar
     */
    async getEvents(
        userId: string,
        timeMin: string,
        timeMax: string,
    ): Promise<CalendarEvent[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user?.googleAccessToken) {
            throw new Error('No Google access token available');
        }

        const params = new URLSearchParams({
            timeMin,
            timeMax,
            singleEvents: 'true',
            orderBy: 'startTime',
        });

        const response = await fetch(
            `${this.calendarApiUrl}/calendars/primary/events?${params}`,
            {
                headers: {
                    Authorization: `Bearer ${user.googleAccessToken}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Calendar API error:', error);
            if (response.status === 401) {
                throw new Error('Token expired - re-authentication required');
            }
            throw new Error('Failed to fetch calendar events');
        }

        const data = await response.json();
        return data.items || [];
    }

    /**
     * Create a new event in Google Calendar
     */
    async createEvent(userId: string, event: CalendarEvent): Promise<CalendarEvent> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user?.googleAccessToken) {
            throw new Error('No Google access token available');
        }

        const response = await fetch(
            `${this.calendarApiUrl}/calendars/primary/events`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${user.googleAccessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            },
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Calendar API create error:', error);
            throw new Error('Failed to create calendar event');
        }

        return response.json();
    }

    /**
     * Update an existing event in Google Calendar
     */
    async updateEvent(
        userId: string,
        eventId: string,
        event: Partial<CalendarEvent>,
    ): Promise<CalendarEvent> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user?.googleAccessToken) {
            throw new Error('No Google access token available');
        }

        const response = await fetch(
            `${this.calendarApiUrl}/calendars/primary/events/${eventId}`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${user.googleAccessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(event),
            },
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Calendar API update error:', error);
            throw new Error('Failed to update calendar event');
        }

        return response.json();
    }

    /**
     * Delete an event from Google Calendar
     */
    async deleteEvent(userId: string, eventId: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user?.googleAccessToken) {
            throw new Error('No Google access token available');
        }

        const response = await fetch(
            `${this.calendarApiUrl}/calendars/primary/events/${eventId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user.googleAccessToken}`,
                },
            },
        );

        if (!response.ok && response.status !== 404) {
            const error = await response.text();
            console.error('Calendar API delete error:', error);
            throw new Error('Failed to delete calendar event');
        }
    }

    /**
     * Sync a task to Google Calendar (with reminders/alarms)
     */
    async syncTaskToCalendar(
        userId: string,
        task: {
            title: string;
            scheduledDate: string;
            startTime?: string;
            duration?: number;
            googleEventId?: string;
            projectName?: string;
        },
    ): Promise<string> {
        const timeZone = 'Asia/Seoul';

        let start: CalendarEvent['start'];
        let end: CalendarEvent['end'];

        if (task.startTime) {
            // Timed event
            const startDateTime = `${task.scheduledDate}T${task.startTime}:00`;
            const durationMinutes = task.duration || 30;
            const endDate = new Date(new Date(startDateTime).getTime() + durationMinutes * 60000);
            const endDateTime = endDate.toISOString().slice(0, 19);

            start = { dateTime: startDateTime, timeZone };
            end = { dateTime: endDateTime, timeZone };
        } else {
            // All-day event: end = next day (Google Calendar convention)
            const nextDay = new Date(task.scheduledDate);
            nextDay.setDate(nextDay.getDate() + 1);
            const nextDayStr = nextDay.toISOString().slice(0, 10);

            start = { date: task.scheduledDate };
            end = { date: nextDayStr };
        }

        const eventSummary = task.projectName
            ? `[${task.projectName}] ${task.title}`
            : task.title;

        const event: CalendarEvent = {
            summary: eventSummary,
            description: task.projectName
                ? `📁 프로젝트: ${task.projectName}\n\nThe End Planner에서 자동 동기화된 할 일입니다.`
                : 'The End Planner에서 자동 동기화된 할 일입니다.',
            start,
            end,
            // 알람: 팝업 10분 전, 이메일 30분 전
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: 10 },
                    { method: 'email', minutes: 30 },
                ],
            },
        };

        if (task.googleEventId) {
            const updated = await this.updateEvent(userId, task.googleEventId, event);
            return updated.id!;
        } else {
            const created = await this.createEvent(userId, event);
            return created.id!;
        }
    }
}
