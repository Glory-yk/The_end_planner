import client from './client';

export interface CalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: {
        dateTime?: string; // ISO string
        date?: string; // YYYY-MM-DD
    };
    end: {
        dateTime?: string; // ISO string
        date?: string; // YYYY-MM-DD
    };
}

export const calendarApi = {
    getAll: async (timeMin?: string, timeMax?: string) => {
        const params = new URLSearchParams();
        if (timeMin) params.append('timeMin', timeMin);
        if (timeMax) params.append('timeMax', timeMax);

        const response = await client.get(`/calendar/events?${params.toString()}`);
        return response.data.events as CalendarEvent[];
    },

    sync: async () => {
        const response = await client.post('/calendar/sync');
        return response.data;
    },

    // 개별 태스크를 구글 캘린더에 동기화 (알람 포함)
    syncTask: async (taskId: string) => {
        const response = await client.post('/calendar/sync-task', { taskId });
        return response.data as { message: string; eventId: string };
    },

    // 프로젝트 전체 태스크를 구글 캘린더에 동기화
    syncProject: async (projectId: string) => {
        const response = await client.post(`/calendar/sync-project/${projectId}`);
        return response.data as { message: string; synced: number; failed: number };
    },
};
