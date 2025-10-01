import { Module } from '@nestjs/common';
import { ComparisonService } from './services/comparison.service';
import { ComparisonController } from './controllers/comparison.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ComparisonController],
  providers: [ComparisonService],
})
export class ComparisonModule { }
