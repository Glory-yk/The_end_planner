export interface Todo {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: string;
  convertedTaskId?: string; // Task로 변환된 경우 해당 Task ID
}
