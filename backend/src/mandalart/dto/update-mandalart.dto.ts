import { IsArray, IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MandalartTodoDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  text: string;

  @IsOptional()
  @IsBoolean()
  isCompleted: boolean;

  @IsOptional()
  @IsString()
  createdAt: string;

  @IsOptional()
  @IsString()
  convertedTaskId?: string;
}

// Grid data structure matching frontend
export class MandalartGridDataDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cells: string[];

  @IsOptional()
  @IsArray()
  @IsArray({ each: true })
  linkedTaskIds: string[][];

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  cellProgress: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MandalartTodoDto)
  cellTodos: MandalartTodoDto[][];

  @IsOptional()
  @IsNumber()
  subGoalProgress?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  cellIcons?: (string | null)[];
}

// DTO for updating mandalart data
export class UpdateMandalartDto {
  @IsArray()
  @IsNotEmpty()
  // @ValidateNested({ each: true })
  // @Type(() => MandalartGridDataDto)
  data: any[]; // Relaxed to any[] for debugging
}
