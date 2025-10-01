import { Module } from '@nestjs/common';
import { IaService } from './services/ia.service';
import { IaController } from './controllers/ia.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [IaController],
  providers: [IaService],
})
export class IaModule { }
