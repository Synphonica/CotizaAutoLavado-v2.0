import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { ServicesModule } from './services/services.module';
import { ReviewsModule } from './reviews/reviews.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';
import { ComparisonModule } from './comparison/comparison.module';
import { MapsModule } from './maps/maps.module';
import { IaModule } from './ia/ia.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';
import { BookingsModule } from './bookings/bookings.module';
import { PriceAlertsModule } from './price-alerts/price-alerts.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Módulo de Schedule (para cron jobs)
    ScheduleModule.forRoot(),

    // Módulo de Prisma (global)
    PrismaModule,

    // Módulo de Supabase (global)
    SupabaseModule,

    // Módulo de autenticación
    AuthModule,

    // Módulos de la aplicación
    UsersModule,
    ProvidersModule,
    ServicesModule,
    ReviewsModule,
    FavoritesModule,
    NotificationsModule,
    SearchModule,
    HealthModule,
    ComparisonModule,
    MapsModule,
    IaModule,
    AnalyticsModule,
    UploadModule,
    EmailModule,
    BookingsModule,
    PriceAlertsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }