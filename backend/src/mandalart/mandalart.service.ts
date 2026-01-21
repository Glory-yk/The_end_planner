import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mandalart, MandalartGridData } from './entities/mandalart.entity';
import { UpdateMandalartDto } from './dto/update-mandalart.dto';

@Injectable()
export class MandalartService {
  constructor(
    @InjectRepository(Mandalart)
    private mandalartRepository: Repository<Mandalart>,
  ) {}

  // Create initial empty mandalart data
  private createInitialData(): MandalartGridData[] {
    return Array(9)
      .fill(null)
      .map((_, i) => ({
        id: i,
        title: '',
        cells: Array(9).fill(''),
        linkedTaskIds: Array(9)
          .fill(null)
          .map(() => []),
        cellProgress: Array(9).fill(0),
        cellTodos: Array(9)
          .fill(null)
          .map(() => []),
        cellIcons: Array(9).fill(null),
      }));
  }

  // Get user's mandalart (create if not exists)
  async getByUserId(userId: string): Promise<MandalartGridData[]> {
    let mandalart = await this.mandalartRepository.findOne({
      where: { userId },
    });

    if (!mandalart) {
      // Create new mandalart for user
      mandalart = this.mandalartRepository.create({
        userId,
        data: JSON.stringify(this.createInitialData()),
      });
      await this.mandalartRepository.save(mandalart);
    }

    return mandalart.getParsedData();
  }

  // Update user's mandalart
  async update(
    userId: string,
    updateDto: UpdateMandalartDto,
  ): Promise<MandalartGridData[]> {
    let mandalart = await this.mandalartRepository.findOne({
      where: { userId },
    });

    if (!mandalart) {
      // Create new if not exists
      mandalart = this.mandalartRepository.create({
        userId,
        data: JSON.stringify(updateDto.data),
      });
    } else {
      mandalart.data = JSON.stringify(updateDto.data);
    }

    await this.mandalartRepository.save(mandalart);
    return mandalart.getParsedData();
  }

  // Delete user's mandalart (for account deletion, etc.)
  async delete(userId: string): Promise<void> {
    await this.mandalartRepository.delete({ userId });
  }
}
