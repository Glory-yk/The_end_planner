import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsDateString, IsInt, Matches } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  // Schedule fields
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  // Timer fields
  @IsInt()
  @IsOptional()
  actualDuration?: number;

  @IsDateString()
  @IsOptional()
  timerStartedAt?: string;

  // Mandalart integration
  @IsInt()
  @IsOptional()
  mandalartGridIndex?: number;

  @IsInt()
  @IsOptional()
  mandalartCellIndex?: number;
}
