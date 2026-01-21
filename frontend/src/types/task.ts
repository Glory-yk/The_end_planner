export interface FocusSession {
  id: string;
  userId: string;
  taskId: string | null;
  startTime: string; // ISO string
  endTime: string; // ISO string
  duration: number; // in minutes
  memo?: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  scheduledDate: string | null; // ISO date string 'YYYY-MM-DD' or null
  createdAt: string;
  startTime?: string; // 'HH:mm' for schedule view
  duration?: number; // in minutes (planned duration)

  // Timer tracking fields
  // @deprecated Use focusSessions instead
  actualDuration?: number; // 실제 소요 시간 (분) - 타이머 측정값
  // @deprecated Use focusSessions instead
  timerStartedAt?: string; // 타이머 시작 시점 (ISO string)

  // Plan-Action Separation
  focusSessions?: FocusSession[];

  // Mandalart Integration
  mandalartRef?: {
    gridIndex: number;  // Which sub-grid (0-8)
    cellIndex: number;  // Which cell within (0-8)
  };

  // Google Calendar Integration
  googleEventId?: string | null;
}

export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'isCompleted'>;
export type UpdateTaskDto = Partial<CreateTaskDto> & { isCompleted?: boolean };
