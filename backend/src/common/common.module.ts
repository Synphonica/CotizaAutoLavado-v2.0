import { Module, Global } from '@nestjs/common';
import { WinstonLoggerService } from './services/winston-logger.service';
import { SentryService } from './services/sentry.service';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Global()
@Module({
    providers: [
        WinstonLoggerService,
        SentryService,
        CacheInterceptor,
        LoggingInterceptor,
    ],
    exports: [
        WinstonLoggerService,
        SentryService,
        CacheInterceptor,
        LoggingInterceptor,
    ],
})
export class CommonModule { }
