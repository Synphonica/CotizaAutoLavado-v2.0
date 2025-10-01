import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AggregatorService } from '../services/aggregator.service';
import { CreateAggregatorDto } from '../dto/create-aggregator.dto';
import { UpdateAggregatorDto } from '../dto/update-aggregator.dto';

@Controller('aggregator')
export class AggregatorController {
  constructor(private readonly aggregatorService: AggregatorService) { }

  @Post()
  create(@Body() createAggregatorDto: CreateAggregatorDto) {
    return this.aggregatorService.create(createAggregatorDto);
  }

  @Get()
  findAll() {
    return this.aggregatorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aggregatorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAggregatorDto: UpdateAggregatorDto) {
    return this.aggregatorService.update(+id, updateAggregatorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aggregatorService.remove(+id);
  }
}
