import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { WinstonLoggerService } from '../services/winston-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: WinstonLoggerService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();

        const requestId = request.requestId || 'unknown';
        const startTime = Date.now();
        const { method, url, ip, headers } = request;
        const userAgent = headers['user-agent'] || 'unknown';

        // Log incoming request
        this.logger.log(
            `→ ${method} ${url}`,
            'HTTP',
            {
                requestId,
                method,
                url,
                ip,
                userAgent,
            }
        );

        return next.handle().pipe(
            tap((data) => {
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;

                // Log successful response
                this.logger.log(
                    `← ${method} ${url} ${statusCode} ${duration}ms`,
                    'HTTP',
                    {
                        requestId,
                        method,
                        url,
                        statusCode,
                        duration,
                        responseSize: data ? JSON.stringify(data).length : 0,
                    }
                );

                // Log performance metric si la request es lenta
                if (duration > 1000) {
                    this.logger.warn(
                        `Slow request detected: ${method} ${url} took ${duration}ms`,
                        'Performance',
                        {
                            requestId,
                            method,
                            url,
                            duration,
                        }
                    );
                }
            }),
            catchError((error) => {
                const duration = Date.now() - startTime;
                const statusCode = error instanceof HttpException
                    ? error.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;

                // Log error
                this.logger.error(
                    `✗ ${method} ${url} ${statusCode} ${duration}ms - ${error.message}`,
                    error.stack,
                    'HTTP',
                    {
                        requestId,
                        method,
                        url,
                        statusCode,
                        duration,
                        error: {
                            message: error.message,
                            stack: error.stack,
                            name: error.name,
                        },
                    }
                );

                return throwError(() => error);
            }),
        );
    }
}
