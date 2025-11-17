import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PriceAlertsService } from './price-alerts.service';
import { NotificationsService } from '../notifications/services/notifications.service';
import { EmailService } from '../email/services/email.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PriceMonitoringService {
    private readonly logger = new Logger(PriceMonitoringService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly priceAlertsService: PriceAlertsService,
        private readonly notificationsService: NotificationsService,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Job que se ejecuta cada hora para verificar cambios de precios
     * y disparar alertas
     * TEMPORALMENTE DESACTIVADO - Comentar para reactivar
     */
    // @Cron(CronExpression.EVERY_HOUR)
    async checkPriceChanges() {
        this.logger.log('🔍 Iniciando verificación de cambios de precios...');

        try {
            // Obtener todas las alertas activas
            const activeAlerts = await this.priceAlertsService.findAllActive();

            if (activeAlerts.length === 0) {
                this.logger.log('No hay alertas activas para procesar');
                return;
            }

            this.logger.log(`Procesando ${activeAlerts.length} alertas activas`);

            let alertsTriggered = 0;

            for (const alert of activeAlerts) {
                try {
                    const shouldNotify = await this.checkIfShouldNotify(alert);

                    if (shouldNotify) {
                        await this.sendNotifications(alert);
                        alertsTriggered++;
                    }
                } catch (error) {
                    this.logger.error(
                        `Error procesando alerta ${alert.id}: ${error.message}`,
                        error.stack,
                    );
                }
            }

            this.logger.log(
                `✅ Verificación completada. ${alertsTriggered} alertas disparadas de ${activeAlerts.length}`,
            );
        } catch (error) {
            this.logger.error('Error en checkPriceChanges:', error.message, error.stack);
        }
    }

    /**
     * Job que registra el historial de precios cada 6 horas
     */
    @Cron(CronExpression.EVERY_6_HOURS)
    async recordPriceSnapshot() {
        this.logger.log('📊 Registrando snapshot de precios...');

        try {
            // Obtener todos los servicios activos
            const services = await this.prisma.service.findMany({
                where: {
                    status: 'ACTIVE',
                    isAvailable: true,
                },
                select: {
                    id: true,
                    price: true,
                },
            });

            this.logger.log(`Registrando ${services.length} servicios`);

            for (const service of services) {
                await this.priceAlertsService.recordPriceHistory(service.id, service.price);
            }

            this.logger.log('✅ Snapshot de precios completado');
        } catch (error) {
            this.logger.error('Error en recordPriceSnapshot:', error.message, error.stack);
        }
    }

    /**
     * Verificar si una alerta debe dispararse
     */
    private async checkIfShouldNotify(alert: any): Promise<boolean> {
        const currentPrice = alert.service.discountedPrice || alert.service.price;

        // Si tiene precio objetivo definido
        if (alert.targetPrice) {
            const targetPrice = new Decimal(alert.targetPrice);
            if (currentPrice.lte(targetPrice)) {
                this.logger.log(
                    `🎯 Alerta ${alert.id}: Precio objetivo alcanzado (${currentPrice} <= ${targetPrice})`,
                );
                return true;
            }
        }

        // Si tiene porcentaje de descuento definido
        if (alert.percentageOff) {
            const history = await this.priceAlertsService.getPriceHistory(alert.serviceId, 1);

            if (history.length > 0 && history[0].oldPrice) {
                const oldPrice = history[0].oldPrice;
                const priceDecreasePercent = oldPrice
                    .sub(currentPrice)
                    .div(oldPrice)
                    .mul(100)
                    .toNumber();

                if (priceDecreasePercent >= alert.percentageOff) {
                    this.logger.log(
                        `📉 Alerta ${alert.id}: Descuento del ${priceDecreasePercent.toFixed(1)}% detectado`,
                    );
                    return true;
                }
            }
        }

        // Verificar si hubo una bajada de precio (sin criterios específicos)
        if (!alert.targetPrice && !alert.percentageOff) {
            const history = await this.priceAlertsService.getPriceHistory(alert.serviceId, 1);

            if (history.length > 0 && history[0].changeType === 'decrease') {
                this.logger.log(`💰 Alerta ${alert.id}: Bajada de precio detectada`);
                return true;
            }
        }

        return false;
    }

    /**
     * Enviar notificaciones (email + in-app)
     */
    private async sendNotifications(alert: any) {
        const { user, service, notifyEmail, notifyInApp } = alert;
        const currentPrice = service.discountedPrice || service.price;

        // Calcular información del descuento
        const history = await this.priceAlertsService.getPriceHistory(alert.serviceId, 1);
        let discountPercent = 0;
        let oldPrice = currentPrice;

        if (history.length > 0 && history[0].oldPrice) {
            oldPrice = history[0].oldPrice;
            discountPercent = Number(
                oldPrice.sub(currentPrice).div(oldPrice).mul(100).toFixed(1),
            );
        }

        // Notificación in-app
        if (notifyInApp) {
            try {
                await this.notificationsService.create({
                    userId: user.id,
                    type: 'PRICE_ALERT',
                    title: '🔔 ¡Alerta de Precio!',
                    message: `${service.name} bajó a $${currentPrice.toString()} ${discountPercent > 0 ? `(${discountPercent}% off)` : ''}`,
                    data: {
                        serviceId: service.id,
                        serviceName: service.name,
                        providerName: service.provider.businessName,
                        currentPrice: currentPrice.toString(),
                        oldPrice: oldPrice.toString(),
                        discountPercent,
                        alertId: alert.id,
                    },
                    actionUrl: `/services/${service.id}`,
                });

                this.logger.log(`📱 Notificación in-app enviada a ${user.email}`);
            } catch (error) {
                this.logger.error(`Error enviando notificación in-app: ${error.message}`);
            }
        }

        // Notificación por email
        if (notifyEmail) {
            try {
                await this.emailService.sendPriceAlertEmail({
                    to: user.email,
                    userName: `${user.firstName} ${user.lastName}`,
                    serviceName: service.name,
                    providerName: service.provider.businessName,
                    currentPrice: Number(currentPrice),
                    oldPrice: Number(oldPrice),
                    discountPercent,
                    serviceUrl: `${process.env.FRONTEND_URL}/services/${service.id}`,
                });

                this.logger.log(`📧 Email enviado a ${user.email}`);
            } catch (error) {
                this.logger.error(`Error enviando email: ${error.message}`);
            }
        }

        // Marcar alerta como notificada
        await this.priceAlertsService.markAsNotified(alert.id);
    }

    /**
     * Método manual para testear alertas
     */
    async testAlert(alertId: string) {
        const alert = await this.prisma.priceAlert.findUnique({
            where: { id: alertId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        discountedPrice: true,
                        provider: {
                            select: {
                                businessName: true,
                                city: true,
                            },
                        },
                    },
                },
            },
        });

        if (!alert) {
            throw new Error(`Alerta ${alertId} no encontrada`);
        }

        this.logger.log(`🧪 Testeando alerta ${alertId}...`);
        await this.sendNotifications(alert);
        this.logger.log(`✅ Test completado para alerta ${alertId}`);
    }
}
