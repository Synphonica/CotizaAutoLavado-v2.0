import { Module } from '@nestjs/common';
import { AggregatorService } from './services/aggregator.service';
import { AggregatorController } from './controllers/aggregator.controller';

@Module({
  controllers: [AggregatorController],
  providers: [AggregatorService],
})
export class AggregatorModule { }
