import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MandalartService } from './mandalart.service';
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
  // BYPASSING DTO to avoid any data stripping
  @Put()
  async update(
    @Request() req: { user: { id: string } },
    @Body() body: any, // Raw body without DTO transformation
  ) {
    try {
      const rawDataStr = JSON.stringify(body);
      console.log(`[Controller] RAW body received, size: ${rawDataStr.length} bytes`);
      console.log(`[Controller] RAW body sample: ${rawDataStr.slice(0, 200)}...`);

      // Extract 'data' from body since frontend sends { data: [...] }
      const updateDto = { data: body.data || body };

      const data = await this.mandalartService.update(req.user.id, updateDto);
      return { data };
    } catch (error) {
      console.error('FAILED to update Mandalart:', error);
      throw error;
    }
  }
}

