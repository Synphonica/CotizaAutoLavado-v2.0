import { Injectable, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';

/**
 * Decorador para configurar rate limiting por usuario
 * @param limit Número máximo de requests
 * @param ttl Tiempo en segundos
 */
export const UserRateLimit = (limit: number, ttl: number) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata('user-rate-limit', { limit, ttl }, descriptor.value);
        return descriptor;
    };
};

/**
 * Guard para limitar requests por usuario autenticado
 * Usa un Map en memoria (en producción usar Redis)
 */
@Injectable()
export class UserRateLimitGuard {
    private requests = new Map<string, { count: number; resetTime: number }>();

    constructor(private reflector: Reflector) {
        // Limpiar entradas expiradas cada minuto
        setInterval(() => this.cleanup(), 60000);
    }

    canActivate(context: ExecutionContext): boolean {
        const config = this.reflector.get<{ limit: number; ttl: number }>(
            'user-rate-limit',
            context.getHandler(),
        );

        // Si no hay configuración, permitir acceso
        if (!config) {
            return true;
        }

        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const user = (request as any).user;

        // Si no hay usuario (ruta pública), usar IP
        const identifier = user?.id || request.ip;

        if (!identifier) {
            return true;
        }

        const now = Date.now();
        const key = `${identifier}:${context.getHandler().name}`;
        const record = this.requests.get(key);

        // Si no existe o ya expiró, crear nuevo registro
        if (!record || now > record.resetTime) {
            this.requests.set(key, {
                count: 1,
                resetTime: now + config.ttl * 1000,
            });
            return true;
        }

        // Incrementar contador
        record.count++;

        // Si excede el límite, rechazar
        if (record.count > config.limit) {
            const retryAfter = Math.ceil((record.resetTime - now) / 1000);
            throw new HttpException(
                {
                    statusCode: HttpStatus.TOO_MANY_REQUESTS,
                    message: `Rate limit exceeded. Try again in ${retryAfter} seconds`,
                    error: 'Too Many Requests',
                },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        return true;
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, record] of this.requests.entries()) {
            if (now > record.resetTime) {
                this.requests.delete(key);
            }
        }
    }
}
