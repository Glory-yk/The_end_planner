import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SpeakingService } from './speaking.service';
import { FeedbackRequestDto } from './dto/feedback-request.dto';
import { ChatRequestDto } from './dto/chat-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('speaking')
@UseGuards(JwtAuthGuard)
export class SpeakingController {
  constructor(private readonly speakingService: SpeakingService) {}

  @Post('feedback')
  async getFeedback(@Body() dto: FeedbackRequestDto) {
    return this.speakingService.getFeedback(dto.transcript, dto.language);
  }

  @Post('chat')
  async chat(@Body() dto: ChatRequestDto) {
    return this.speakingService.chat(dto.messages, dto.language);
  }
}
