import { IsString, IsOptional } from 'class-validator';

export class UpdateProjectDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    color?: string | null;
}
