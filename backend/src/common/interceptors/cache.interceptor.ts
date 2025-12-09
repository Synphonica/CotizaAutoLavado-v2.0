import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

interface CacheEntry {
    data: any;
    timestamp: number;
}

/**
 * Interceptor de caché en memoria para mejorar performance
 * Cachea respuestas GET durante un TTL configurable
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private cache = new Map<string, CacheEntry>();
    private readonly DEFAULT_TTL = 60 * 1000; // 60 segundos

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url } = request;

        // Solo cachear peticiones GET
        if (method !== 'GET') {
            return next.handle();
        }

        // Excluir rutas que no deben cachearse
        const excludedPaths = [
            '/auth',
            '/bookings',
            '/notifications',
            '/admin',
        ];

        if (excludedPaths.some(path => url.includes(path))) {
            return next.handle();
        }

        const cacheKey = this.generateCacheKey(request);
        const cached = this.get(cacheKey);

        if (cached) {
            console.log(`[Cache] HIT: ${cacheKey}`);
            return of(cached);
        }

        console.log(`[Cache] MISS: ${cacheKey}`);
        return next.handle().pipe(
            tap(data => {
                this.set(cacheKey, data);
            })
        );
    }

    private generateCacheKey(request: any): string {
        const { url, query } = request;
        return `${url}:${JSON.stringify(query || {})}`;
    }

    private get(key: string): any | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        const now = Date.now();
        if (now - entry.timestamp > this.DEFAULT_TTL) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    private set(key: string, data: any): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });

        // Limpiar caché antigua cada 5 minutos
        if (this.cache.size > 1000) {
            this.cleanup();
        }
    }

    private cleanup(): void {
        const now = Date.now();
        let removed = 0;

        this.cache.forEach((entry, key) => {
            if (now - entry.timestamp > this.DEFAULT_TTL) {
                this.cache.delete(key);
                removed++;
            }
        });

        console.log(`[Cache] Limpieza: ${removed} entradas eliminadas`);
    }

    /**
     * Método para invalidar caché manualmente
     */
    invalidate(pattern?: string): void {
        if (!pattern) {
            this.cache.clear();
            console.log('[Cache] Caché completo invalidado');
            return;
        }

        let removed = 0;
        this.cache.forEach((_, key) => {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                removed++;
            }
        });

        console.log(`[Cache] ${removed} entradas con patrón "${pattern}" invalidadas`);
    }

    /**
     * Obtener estadísticas de caché
     */
    getStats(): { size: number; hits: number; misses: number } {
        return {
            size: this.cache.size,
            hits: 0, // TODO: implementar contador
            misses: 0, // TODO: implementar contador
        };
    }
}
