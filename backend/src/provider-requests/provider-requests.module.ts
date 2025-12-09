import { Module } from '@nestjs/common';
import { ProviderRequestsService } from './provider-requests.service';
import { ProviderRequestsController } from './provider-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ProviderRequestsController],
    providers: [ProviderRequestsService],
    exports: [ProviderRequestsService],
})
export class ProviderRequestsModule { }
