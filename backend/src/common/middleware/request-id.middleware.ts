import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extender el tipo Request para incluir requestId
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            startTime?: number;
        }
    }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Generar o usar el request ID del header
        const requestId = (req.headers['x-request-id'] as string) || uuidv4();

        // Agregar request ID al request
        req.requestId = requestId;
        req.startTime = Date.now();

        // Agregar request ID al response header
        res.setHeader('X-Request-ID', requestId);

        next();
    }
}
