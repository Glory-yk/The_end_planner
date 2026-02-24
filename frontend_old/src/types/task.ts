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

// 요일 타입 (0: 일요일 ~ 6: 토요일)
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// 반복 설정 인터페이스
export interface RecurrenceRule {
  type: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: DayOfWeek[]; // weekly 타입일 때 반복할 요일들
  interval?: number; // 반복 간격 (예: 2 = 2일마다, 2주마다)
  endDate?: string; // 반복 종료일 (없으면 무제한)
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

  // Routine/Recurrence
  isRoutine?: boolean; // 루틴 여부
  recurrence?: RecurrenceRule; // 반복 규칙
  routineParentId?: string; // 원본 루틴 ID (반복으로 생성된 작업인 경우)
}

export type CreateTaskDto = Omit<Task, 'id' | 'createdAt' | 'isCompleted'>;
export type UpdateTaskDto = Partial<CreateTaskDto> & { isCompleted?: boolean };
