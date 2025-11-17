import { Module } from '@nestjs/common';
import { PriceAlertsService } from './price-alerts.service';
import { PriceAlertsController } from './price-alerts.controller';
import { PriceMonitoringService } from './price-monitoring.service';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { EmailModule } from '../email/email.module';

@Module({
    imports: [PrismaModule, NotificationsModule, EmailModule],
    controllers: [PriceAlertsController],
    providers: [PriceAlertsService, PriceMonitoringService],
    exports: [PriceAlertsService, PriceMonitoringService],
})
export class PriceAlertsModule { }
