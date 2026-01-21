import { IsArray, IsNotEmpty } from 'class-validator';

// DTO for updating mandalart data
export class UpdateMandalartDto {
  @IsArray()
  @IsNotEmpty()
  data: MandalartGridDataDto[];
}

// Grid data structure matching frontend
export class MandalartGridDataDto {
  id: number;
  title: string;
  cells: string[];
  linkedTaskIds: string[][];
  cellProgress: number[];
  cellTodos: MandalartTodoDto[][];
  subGoalProgress?: number;
  icon?: string;
  cellIcons?: (string | null)[];
}

export class MandalartTodoDto {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: string;
  convertedTaskId?: string;
}
