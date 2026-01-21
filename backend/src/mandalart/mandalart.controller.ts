import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MandalartService } from './mandalart.service';
import { UpdateMandalartDto } from './dto/update-mandalart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mandalart')
@UseGuards(JwtAuthGuard)
export class MandalartController {
  constructor(private readonly mandalartService: MandalartService) { }

  // GET /mandalart - Get user's mandalart data
  @Get()
  async get(@Request() req: { user: { id: string } }) {
    const data = await this.mandalartService.getByUserId(req.user.id);
    return { data };
  }

  // PUT /mandalart - Update user's mandalart data
  @Put()
  async update(
    @Request() req: { user: { id: string } },
    @Body() updateDto: UpdateMandalartDto,
  ) {
    try {
      console.log(`Updating Mandalart for user ${req.user.id}, data size: ${JSON.stringify(updateDto).length} bytes`);
      const data = await this.mandalartService.update(req.user.id, updateDto);
      return { data };
    } catch (error) {
      console.error('FAILED to update Mandalart:', error);
      throw error;
    }
  }
}
