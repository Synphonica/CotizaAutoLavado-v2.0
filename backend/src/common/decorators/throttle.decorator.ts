import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
    limit: number;
    ttl: number;
}

/**
 * Decorador para aplicar rate limiting personalizado por endpoint
 * @param limit - Número máximo de requests
 * @param ttl - Ventana de tiempo en segundos
 * 
 * @example
 * @Throttle({ limit: 10, ttl: 60 }) // 10 requests por minuto
 * @Post('search')
 * async search() { ... }
 */
export const Throttle = (options: ThrottleOptions) =>
    SetMetadata(THROTTLE_KEY, options);

/**
 * Decoradores predefinidos para casos comunes
 */
export const ThrottleStrict = () => Throttle({ limit: 10, ttl: 60 }); // 10/min
export const ThrottleModerate = () => Throttle({ limit: 30, ttl: 60 }); // 30/min
export const ThrottleGenerous = () => Throttle({ limit: 100, ttl: 60 }); // 100/min
export const ThrottlePublic = () => Throttle({ limit: 1000, ttl: 60 }); // 1000/min
