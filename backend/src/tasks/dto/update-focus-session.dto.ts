import { IsString, IsOptional } from 'class-validator';

export class UpdateFocusSessionDto {
    @IsString()
    @IsOptional()
    taskId?: string;

    @IsString()
    @IsOptional()
    memo?: string;
}
