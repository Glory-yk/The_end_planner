import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MandalartController } from './mandalart.controller';
import { MandalartService } from './mandalart.service';
import { Mandalart } from './entities/mandalart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mandalart])],
  controllers: [MandalartController],
  providers: [MandalartService],
  exports: [MandalartService],
})
export class MandalartModule {}
