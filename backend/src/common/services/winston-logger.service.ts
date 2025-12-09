import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

@Injectable()
export class WinstonLoggerService implements LoggerService {
    private logger: winston.Logger;

    constructor() {
        const logFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.errors({ stack: true }),
            winston.format.splat(),
            winston.format.json(),
        );

        const consoleFormat = winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('AltoCarwash', {
                colors: true,
                prettyPrint: true,
            }),
        );

        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: logFormat,
            defaultMeta: {
                service: 'alto-carwash-api',
                environment: process.env.NODE_ENV || 'development',
            },
            transports: [
                // Console transport con colores para desarrollo
                new winston.transports.Console({
                    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
                }),

                // File transport para errores
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),

                // File transport para todos los logs
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                }),
            ],
            exceptionHandlers: [
                new winston.transports.File({ filename: 'logs/exceptions.log' }),
            ],
            rejectionHandlers: [
                new winston.transports.File({ filename: 'logs/rejections.log' }),
            ],
        });
    }

    log(message: any, ...optionalParams: any[]) {
        const context = optionalParams[0];
        const meta = this.extractMeta(optionalParams);

        this.logger.info(message, {
            context,
            ...meta,
        });
    }

    error(message: any, ...optionalParams: any[]) {
        const trace = optionalParams[0];
        const context = optionalParams[1];
        const meta = this.extractMeta(optionalParams);

        this.logger.error(message, {
            trace,
            context,
            ...meta,
        });
    }

    warn(message: any, ...optionalParams: any[]) {
        const context = optionalParams[0];
        const meta = this.extractMeta(optionalParams);

        this.logger.warn(message, {
            context,
            ...meta,
        });
    }

    debug(message: any, ...optionalParams: any[]) {
        const context = optionalParams[0];
        const meta = this.extractMeta(optionalParams);

        this.logger.debug(message, {
            context,
            ...meta,
        });
    }

    verbose(message: any, ...optionalParams: any[]) {
        const context = optionalParams[0];
        const meta = this.extractMeta(optionalParams);

        this.logger.verbose(message, {
            context,
            ...meta,
        });
    }

    // Métodos personalizados para logging avanzado
    logRequest(req: any, requestId: string) {
        this.logger.info('Incoming request', {
            requestId,
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        });
    }

    logResponse(req: any, res: any, requestId: string, duration: number) {
        this.logger.info('Request completed', {
            requestId,
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    }

    logDatabaseQuery(query: string, duration: number, params?: any[]) {
        this.logger.debug('Database query executed', {
            query,
            duration: `${duration}ms`,
            params,
        });
    }

    logPerformanceMetric(metric: string, value: number, unit: string = 'ms') {
        this.logger.info('Performance metric', {
            metric,
            value,
            unit,
        });
    }

    logBusinessEvent(event: string, data: any) {
        this.logger.info('Business event', {
            event,
            data,
        });
    }

    private extractMeta(optionalParams: any[]): any {
        if (optionalParams.length > 1 && typeof optionalParams[optionalParams.length - 1] === 'object') {
            return optionalParams[optionalParams.length - 1];
        }
        return {};
    }

    // Obtener la instancia de Winston para uso directo si es necesario
    getWinstonLogger(): winston.Logger {
        return this.logger;
    }
}
