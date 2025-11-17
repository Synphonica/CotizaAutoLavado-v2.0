import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

/**
 * Interceptor to capture errors and performance metrics with Sentry (v8 API)
 */
@Injectable()
export class SentryInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user } = request;

        // Start span for performance monitoring (v8 API)
        return Sentry.startSpan(
            {
                op: 'http.server',
                name: `${method} ${url}`,
            },
            (span) => {
                // Set user context
                Sentry.setUser({
                    id: user?.id,
                    email: user?.email,
                    username: user?.username,
                });

                // Set tags
                Sentry.setTag('http.method', method);
                Sentry.setTag('http.url', url);

                return next.handle().pipe(
                    tap(() => {
                        // Mark span as successful
                        const response = context.switchToHttp().getResponse();
                        span?.setStatus({ code: 1, message: 'ok' });
                        span?.setAttribute('http.status_code', response.statusCode);
                    }),
                    catchError((error) => {
                        // Capture exception
                        Sentry.captureException(error, {
                            tags: {
                                method,
                                url,
                            },
                            extra: {
                                userId: user?.id,
                                body: request.body,
                                query: request.query,
                                params: request.params,
                            },
                        });

                        // Mark span as error
                        span?.setStatus({ code: 2, message: 'internal_error' });
                        span?.setAttribute('http.status_code', error.status || 500);

                        return throwError(() => error);
                    }),
                );
            },
        );
    }
}
