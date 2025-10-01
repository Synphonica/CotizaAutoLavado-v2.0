import { Injectable } from '@nestjs/common';
import { CreateAggregatorDto } from '../dto/create-aggregator.dto';
import { UpdateAggregatorDto } from '../dto/update-aggregator.dto';

@Injectable()
export class AggregatorService {
  create(createAggregatorDto: CreateAggregatorDto) {
    return 'This action adds a new aggregator';
  }

  findAll() {
    return `This action returns all aggregator`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aggregator`;
  }

  update(id: number, updateAggregatorDto: UpdateAggregatorDto) {
    return `This action updates a #${id} aggregator`;
  }

  remove(id: number) {
    return `This action removes a #${id} aggregator`;
  }
}
