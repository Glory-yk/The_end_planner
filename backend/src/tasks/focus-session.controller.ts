import { Controller, Get, Post, Body, Param, Put, UseGuards, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FocusSessionService } from './focus-session.service';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';
import { UpdateFocusSessionDto } from './dto/update-focus-session.dto';

@Controller('focus-sessions')
@UseGuards(JwtAuthGuard)
export class FocusSessionController {
    constructor(private readonly sessionService: FocusSessionService) { }

    @Post()
    create(
        @Body() createDto: CreateFocusSessionDto,
        @Req() req: any,
    ) {
        return this.sessionService.create(createDto, req.user);
    }

    @Get()
    findAll(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Req() req: any,
    ) {
        return this.sessionService.findAll(req.user, startDate, endDate);
    }

    @Get('unassigned')
    findUnassigned(@Req() req: any) {
        return this.sessionService.findUnassigned(req.user);
    }

    @Put(':id/link')
    linkToTask(
        @Param('id') id: string,
        @Body() updateDto: UpdateFocusSessionDto,
        @Req() req: any,
    ) {
        return this.sessionService.linkToTask(id, updateDto, req.user);
    }
}
