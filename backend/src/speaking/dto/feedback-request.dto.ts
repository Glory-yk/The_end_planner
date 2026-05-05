import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class FeedbackRequestDto {
  @IsString()
  @IsNotEmpty()
  transcript: string;

  @IsString()
  @IsOptional()
  language?: string;
}
