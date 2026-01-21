import { IsArray, IsNotEmpty, IsNumber, IsString, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MandalartTodoDto {
  @IsString()
  id: string;

  @IsString()
  text: string;

  @IsBoolean()
  isCompleted: boolean;

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

  @IsArray()
  @IsString({ each: true })
  cells: string[];

  @IsArray()
  @IsArray({ each: true })
  linkedTaskIds: string[][];

  @IsArray()
  @IsNumber({}, { each: true })
  cellProgress: number[];

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
  @ValidateNested({ each: true })
  @Type(() => MandalartGridDataDto)
  data: MandalartGridDataDto[];
}
