import { Module } from '@nestjs/common';
import { SearchService } from './service/search.service';
import { SearchController } from './controllers/search.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule { }
