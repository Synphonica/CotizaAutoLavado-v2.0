import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WinstonLoggerService } from '../common/services/winston-logger.service';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import * as fs from 'fs';
import * as path from 'path';

interface LogStats {
    errorLogSize: number;
    combinedLogSize: number;
    exceptionsLogSize: number;
    rejectionsLogSize: number;
    logDirectory: string;
    files: string[];
}

@ApiTags('monitoring')
@Controller('monitoring')
@ApiBearerAuth()
export class MonitoringController {
    constructor(
        private readonly logger: WinstonLoggerService,
        private readonly cacheInterceptor: CacheInterceptor,
    ) { }

    @Get('logs/stats')
    @ApiOperation({ summary: 'Obtener estadísticas de logs' })
    @ApiResponse({ status: 200, description: 'Estadísticas de logs obtenidas' })
    async getLogStats(): Promise<LogStats> {
        const logDir = path.join(process.cwd(), 'logs');

        try {
            const files = fs.existsSync(logDir) ? fs.readdirSync(logDir) : [];

            const getFileSize = (filename: string): number => {
                const filePath = path.join(logDir, filename);
                try {
                    return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
                } catch {
                    return 0;
                }
            };

            return {
                errorLogSize: getFileSize('error.log'),
                combinedLogSize: getFileSize('combined.log'),
                exceptionsLogSize: getFileSize('exceptions.log'),
                rejectionsLogSize: getFileSize('rejections.log'),
                logDirectory: logDir,
                files,
            };
        } catch (error) {
            this.logger.error('Error getting log stats', error.stack, 'MonitoringController');
            throw error;
        }
    }

    @Get('cache/stats')
    @ApiOperation({ summary: 'Obtener estadísticas del caché' })
    @ApiResponse({ status: 200, description: 'Estadísticas del caché obtenidas' })
    async getCacheStats() {
        return this.cacheInterceptor.getStats();
    }

    @Get('health/detailed')
    @ApiOperation({ summary: 'Health check detallado con métricas' })
    @ApiResponse({ status: 200, description: 'Métricas del sistema' })
    async getDetailedHealth() {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();

        return {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
            uptimeSeconds: uptime,
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
                external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
            },
            cache: this.cacheInterceptor.getStats(),
            environment: process.env.NODE_ENV || 'development',
        };
    }
}
