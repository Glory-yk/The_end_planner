import client from './client';
import { Task, FocusSession } from '@/types/task';

// API response type matches backend entity
interface TaskApiResponse {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  scheduledDate: string | null;
  startTime: string | null;
  duration: number | null;
  actualDuration: number | null;
  timerStartedAt: string | null;
  mandalartGridIndex: number | null;
  mandalartCellIndex: number | null;
  createdAt: string;
  updatedAt: string;
  focusSessions?: FocusSession[];
}

// Convert API response to frontend Task type
const mapApiToTask = (apiTask: TaskApiResponse): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description || undefined,
  isCompleted: apiTask.isCompleted,
  scheduledDate: apiTask.scheduledDate,
  startTime: apiTask.startTime || undefined,
  duration: apiTask.duration || undefined,
  actualDuration: apiTask.actualDuration || undefined,
  timerStartedAt: apiTask.timerStartedAt || undefined,
  mandalartRef: apiTask.mandalartGridIndex !== null && apiTask.mandalartCellIndex !== null
    ? { gridIndex: apiTask.mandalartGridIndex, cellIndex: apiTask.mandalartCellIndex }
    : undefined,
  focusSessions: apiTask.focusSessions,
  createdAt: apiTask.createdAt,
});

// Convert frontend Task to API request format
const mapTaskToApi = (task: Partial<Task>) => {
  const apiData: Record<string, unknown> = {};

  if (task.title !== undefined) apiData.title = task.title;
  if (task.description !== undefined) apiData.description = task.description || null;
  if (task.isCompleted !== undefined) apiData.isCompleted = task.isCompleted;
  if (task.scheduledDate !== undefined) apiData.scheduledDate = task.scheduledDate;
  if (task.startTime !== undefined) apiData.startTime = task.startTime || null;
  if (task.duration !== undefined) apiData.duration = task.duration || null;
  if (task.actualDuration !== undefined) apiData.actualDuration = task.actualDuration || null;
  if (task.timerStartedAt !== undefined) apiData.timerStartedAt = task.timerStartedAt || null;

  if (task.mandalartRef !== undefined) {
    apiData.mandalartGridIndex = task.mandalartRef?.gridIndex ?? null;
    apiData.mandalartCellIndex = task.mandalartRef?.cellIndex ?? null;
  }

  return apiData;
};

export const taskApi = {
  // ... (existing task methods)
  async getAll(date?: string): Promise<Task[]> {
    const url = date ? `/tasks?date=${date}` : '/tasks';
    const response = await client.get<TaskApiResponse[]>(url);
    return response.data.map(mapApiToTask);
  },
  // Get brain dump (unscheduled) tasks
  async getBrainDump(): Promise<Task[]> {
    const response = await client.get<TaskApiResponse[]>('/tasks/brain-dump');
    return response.data.map(mapApiToTask);
  },

  // Get tasks for a week
  async getWeek(startDate: string): Promise<Task[]> {
    const response = await client.get<TaskApiResponse[]>(`/tasks/week?startDate=${startDate}`);
    return response.data.map(mapApiToTask);
  },

  // Get single task
  async getOne(id: string): Promise<Task> {
    const response = await client.get<TaskApiResponse>(`/tasks/${id}`);
    return mapApiToTask(response.data);
  },

  // Create new task
  async create(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
    const apiData = mapTaskToApi(task);
    const response = await client.post<TaskApiResponse>('/tasks', apiData);
    return mapApiToTask(response.data);
  },

  // Update task
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    const apiData = mapTaskToApi(updates);
    const response = await client.patch<TaskApiResponse>(`/tasks/${id}`, apiData);
    return mapApiToTask(response.data);
  },

  // Delete task
  async delete(id: string): Promise<void> {
    await client.delete(`/tasks/${id}`);
  },

  // Sync Wear OS timer session (Legacy or updated to use FocusSession internally)
  async syncWearSession(session: {
    title?: string;
    startTimeMillis: number;
    endTimeMillis: number;
    durationMinutes: number;
    taskId?: string;
  }): Promise<Task> {
    const response = await client.post<TaskApiResponse>('/tasks/wear-sync', session);
    return mapApiToTask(response.data);
  },
};

export const focusSessionApi = {
  // Create new focus session
  async create(data: {
    taskId?: string;
    startTime: string; // ISO
    endTime: string; // ISO
    duration: number;
    memo?: string;
  }): Promise<FocusSession> {
    const response = await client.post<FocusSession>('/focus-sessions', data);
    return response.data;
  },

  // Get unassigned sessions
  async getUnassigned(): Promise<FocusSession[]> {
    const response = await client.get<FocusSession[]>('/focus-sessions/unassigned');
    return response.data;
  },

  // Link session to task
  async linkToTask(sessionId: string, taskId: string): Promise<FocusSession> {
    const response = await client.put<FocusSession>(`/focus-sessions/${sessionId}/link`, { taskId });
    return response.data;
  },
};

export default taskApi;
