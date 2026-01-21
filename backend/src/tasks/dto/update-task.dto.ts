import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, Matches } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string | null;

  // Schedule fields
  @IsString()
  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string | null;

  @IsInt()
  @IsOptional()
  duration?: number | null;

  // Timer fields
  @IsInt()
  @IsOptional()
  actualDuration?: number | null;

  @IsDateString()
  @IsOptional()
  timerStartedAt?: string | null;

  // Mandalart integration
  @IsInt()
  @IsOptional()
  mandalartGridIndex?: number | null;

  @IsInt()
  @IsOptional()
  mandalartCellIndex?: number | null;
}
