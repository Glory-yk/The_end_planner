import client from './client';
import { Task, CreateTaskDto, UpdateTaskDto } from '../types/task';

export const tasksApi = {
  getAll: async (date?: string): Promise<Task[]> => {
    const params = date ? { date } : {};
    const response = await client.get<Task[]>('/tasks', { params });
    return response.data;
  },

  getBrainDump: async (): Promise<Task[]> => {
    const response = await client.get<Task[]>('/tasks/brain-dump');
    return response.data;
  },

  getWeekTasks: async (startDate: string): Promise<Task[]> => {
    const response = await client.get<Task[]>('/tasks/week', {
      params: { startDate },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await client.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskDto): Promise<Task> => {
    const response = await client.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTaskDto): Promise<Task> => {
    const response = await client.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/tasks/${id}`);
  },
};
