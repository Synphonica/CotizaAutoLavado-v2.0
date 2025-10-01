import { Test, TestingModule } from '@nestjs/testing';
import { ComparisonController } from './comparison.controller';
import { ComparisonService } from '../services/comparison.service';

describe('ComparisonController', () => {
  let controller: ComparisonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComparisonController],
      providers: [ComparisonService],
    }).compile();

    controller = module.get<ComparisonController>(ComparisonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
