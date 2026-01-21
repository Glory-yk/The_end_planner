import { IsString, IsInt, IsOptional, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateFocusSessionDto {
    @IsString()
    @IsOptional()
    taskId?: string; // Optional (Unplanned Action)

    @IsNotEmpty()
    @IsDateString()
    startTime: string; // ISO 8601

    @IsNotEmpty()
    @IsDateString()
    endTime: string; // ISO 8601

    @IsInt()
    @IsNotEmpty()
    duration: number; // minutes

    @IsString()
    @IsOptional()
    memo?: string;
}
