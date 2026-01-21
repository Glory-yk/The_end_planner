import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class WearSessionDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsInt()
  @Min(0)
  startTimeMillis: number; // Unix timestamp in milliseconds

  @IsInt()
  @Min(0)
  endTimeMillis: number; // Unix timestamp in milliseconds

  @IsInt()
  @Min(0)
  durationMinutes: number;

  @IsString()
  @IsOptional()
  taskId?: string; // If assigned to existing task
}
