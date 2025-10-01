import { Test, TestingModule } from '@nestjs/testing';
import { IaController } from './ia.controller';
import { IaService } from '../services/ia.service';

describe('IaController', () => {
  let controller: IaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IaController],
      providers: [IaService],
    }).compile();

    controller = module.get<IaController>(IaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
