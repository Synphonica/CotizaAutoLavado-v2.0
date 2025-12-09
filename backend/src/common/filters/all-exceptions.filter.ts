import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WinstonLoggerService } from '../services/winston-logger.service';
import { SentryService } from '../services/sentry.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    constructor(
        private readonly logger: WinstonLoggerService,
        private readonly sentry: SentryService,
    ) { }

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const requestId = request.requestId || 'unknown';
        const timestamp = new Date().toISOString();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errorDetails: any = {};

        // Determinar tipo de error
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || message;
                errorDetails = exceptionResponse;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            errorDetails = {
                name: exception.name,
                stack: exception.stack,
            };
        }

        // Log del error
        this.logger.error(
            `[${requestId}] ${request.method} ${request.url} - ${status} - ${message}`,
            exception instanceof Error ? exception.stack : '',
            'ExceptionFilter',
            {
                requestId,
                method: request.method,
                url: request.url,
                statusCode: status,
                ip: request.ip,
                userAgent: request.headers['user-agent'],
                body: request.body,
                query: request.query,
                params: request.params,
            }
        );

        // Enviar a Sentry solo errores 5xx
        if (status >= 500) {
            this.sentry.captureException(exception, {
                request: {
                    method: request.method,
                    url: request.url,
                    requestId,
                },
                extra: {
                    body: request.body,
                    query: request.query,
                    params: request.params,
                },
            });
        }

        // Respuesta al cliente
        const errorResponse = {
            statusCode: status,
            timestamp,
            path: request.url,
            method: request.method,
            requestId,
            message,
            ...(process.env.NODE_ENV === 'development' && {
                details: errorDetails,
            }),
        };

        response.status(status).json(errorResponse);
    }
}
