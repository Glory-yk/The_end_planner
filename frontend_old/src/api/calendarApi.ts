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
    }
};
