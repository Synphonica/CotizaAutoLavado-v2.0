import { Injectable } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, PrismaHealthIndicator, HealthCheck, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Enhanced Health Check Service with detailed metrics
 */
@Injectable()
export class HealthService {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
        private prisma: PrismaService,
    ) { }

    @HealthCheck()
    async check() {
        return this.health.check([
            // Database health
            () => this.prisma.$queryRaw`SELECT 1`,

            // Memory health (heap should not exceed 300MB)
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

            // Memory health (RSS should not exceed 300MB)
            () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

            // Disk health (storage should have at least 50% available)
            () => this.disk.checkStorage('disk_health', {
                path: '/',
                thresholdPercent: 0.5,
            }),
        ]);
    }

    /**
     * Get detailed system metrics
     */
    async getMetrics() {
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();

        return {
            timestamp: new Date().toISOString(),
            uptime: {
                seconds: uptime,
                formatted: this.formatUptime(uptime),
            },
            memory: {
                rss: {
                    bytes: memoryUsage.rss,
                    mb: (memoryUsage.rss / 1024 / 1024).toFixed(2),
                },
                heapTotal: {
                    bytes: memoryUsage.heapTotal,
                    mb: (memoryUsage.heapTotal / 1024 / 1024).toFixed(2),
                },
                heapUsed: {
                    bytes: memoryUsage.heapUsed,
                    mb: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2),
                },
                external: {
                    bytes: memoryUsage.external,
                    mb: (memoryUsage.external / 1024 / 1024).toFixed(2),
                },
            },
            cpu: {
                usage: process.cpuUsage(),
            },
            node: {
                version: process.version,
                platform: process.platform,
                arch: process.arch,
            },
            database: await this.getDatabaseMetrics(),
        };
    }

    /**
     * Get database connection metrics
     */
    private async getDatabaseMetrics() {
        try {
            const start = Date.now();
            await this.prisma.$queryRaw`SELECT 1`;
            const responseTime = Date.now() - start;

            return {
                status: 'connected',
                responseTime: `${responseTime}ms`,
            };
        } catch (error) {
            return {
                status: 'disconnected',
                error: error.message,
            };
        }
    }

    /**
     * Format uptime in human-readable format
     */
    private formatUptime(seconds: number): string {
        const days = Math.floor(seconds / (3600 * 24));
        const hours = Math.floor((seconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        const parts: string[] = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0) parts.push(`${secs}s`);

        return parts.join(' ') || '0s';
    }
}
