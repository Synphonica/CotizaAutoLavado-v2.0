import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();
        const request = ctx.getRequest<FastifyRequest>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | object = 'Internal server error';
        let error = 'InternalServerError';

        // Manejo de excepciones HTTP de NestJS
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = exception.name;
            } else if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || message;
                error = (exceptionResponse as any).error || exception.name;
            }
        }

        // Manejo de errores de Prisma
        else if (exception instanceof PrismaClientKnownRequestError) {
            status = HttpStatus.BAD_REQUEST;
            error = 'DatabaseError';

            switch (exception.code) {
                case 'P2002':
                    message = `Duplicate value for field: ${exception.meta?.target}`;
                    status = HttpStatus.CONFLICT;
                    break;
                case 'P2025':
                    message = 'Record not found';
                    status = HttpStatus.NOT_FOUND;
                    break;
                case 'P2003':
                    message = 'Foreign key constraint failed';
                    break;
                case 'P2001':
                    message = 'Record does not exist';
                    status = HttpStatus.NOT_FOUND;
                    break;
                default:
                    message = 'Database operation failed';
            }
        }

        // Manejo de errores genéricos
        else if (exception instanceof Error) {
            message = exception.message;
            error = exception.name;
        }

        // Log del error
        const errorLog = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            error,
            // En desarrollo, incluir stack trace
            ...(process.env.NODE_ENV === 'development' && exception instanceof Error
                ? { stack: exception.stack }
                : {}),
        };

        // Log según severidad
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : JSON.stringify(exception),
            );
        } else if (status >= 400) {
            this.logger.warn(
                `${request.method} ${request.url} - ${message}`,
            );
        }

        // Responder al cliente
        response.status(status).send({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            error,
            message,
            // Solo en desarrollo: incluir detalles adicionales
            ...(process.env.NODE_ENV === 'development' && exception instanceof Error
                ? { details: exception.stack }
                : {}),
        });
    }
}
