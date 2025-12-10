import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { NotificationsByUserDto } from '../dto/notifications-by-user.dto';
import { MarkAsReadDto, MarkAllAsReadDto } from '../dto/mark-as-read.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { NotificationType, NotificationStatus } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Crear una nueva notificación
     */
    async create(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto | null> {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
            where: { id: createNotificationDto.userId }
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Verificar si el usuario tiene habilitadas notificaciones de este tipo
        const isEnabled = await this.isNotificationEnabled(
            createNotificationDto.userId,
            createNotificationDto.type
        );

        // Si las notificaciones de este tipo están deshabilitadas, no crear la notificación
        if (!isEnabled) {
            // Retornar null indicando que no se creó
            return null;
        }

        // Verificar que el proveedor existe (si se proporciona)
        if (createNotificationDto.providerId) {
            const provider = await this.prisma.provider.findUnique({
                where: { id: createNotificationDto.providerId }
            });
            if (!provider) {
                throw new NotFoundException('Proveedor no encontrado');
            }
        }

        // Verificar que el servicio existe (si se proporciona)
        if (createNotificationDto.serviceId) {
            const service = await this.prisma.service.findUnique({
                where: { id: createNotificationDto.serviceId }
            });
            if (!service) {
                throw new NotFoundException('Servicio no encontrado');
            }
        }

        // Crear la notificación
        const notification = await this.prisma.notification.create({
            data: {
                ...createNotificationDto,
                status: createNotificationDto.status || NotificationStatus.UNREAD
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        businessName: true,
                        businessType: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        });

        return this.mapToResponseDto(notification);
    }

    /**
     * Obtener todas las notificaciones con filtros y paginación
     */
    async findAll(queryDto: QueryNotificationsDto): Promise<{
        notifications: NotificationResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', ...filters } = queryDto;
        const skip = (page - 1) * limit;

        // Construir filtros
        const where: any = {};

        if (filters.userId) where.userId = filters.userId;
        if (filters.type) where.type = filters.type;
        if (filters.status) where.status = filters.status;
        if (filters.providerId) where.providerId = filters.providerId;
        if (filters.serviceId) where.serviceId = filters.serviceId;

        // Filtro de solo no leídas
        if (filters.unreadOnly) {
            where.status = NotificationStatus.UNREAD;
        }

        // Filtros de fecha
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
            if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
        }

        // Construir include
        const include: any = {};
        if (filters.includeUser) {
            include.user = {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                }
            };
        }
        if (filters.includeProvider) {
            include.provider = {
                select: {
                    id: true,
                    businessName: true,
                    businessType: true
                }
            };
        }
        if (filters.includeService) {
            include.service = {
                select: {
                    id: true,
                    name: true,
                    type: true
                }
            };
        }

        // Ejecutar consultas
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where,
                include,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit
            }),
            this.prisma.notification.count({ where })
        ]);

        return {
            notifications: notifications.map(notification => this.mapToResponseDto(notification)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    /**
     * Obtener una notificación por ID
     */
    async findOne(id: string): Promise<NotificationResponseDto> {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        businessName: true,
                        businessType: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        });

        if (!notification) {
            throw new NotFoundException('Notificación no encontrada');
        }

        return this.mapToResponseDto(notification);
    }

    /**
     * Actualizar una notificación
     */
    async update(id: string, updateNotificationDto: UpdateNotificationDto, userId?: string): Promise<NotificationResponseDto> {
        const notification = await this.prisma.notification.findUnique({
            where: { id }
        });

        if (!notification) {
            throw new NotFoundException('Notificación no encontrada');
        }

        // Verificar permisos (solo el usuario propietario o admin puede editar)
        if (userId && notification.userId !== userId) {
            throw new ForbiddenException('No tienes permisos para editar esta notificación');
        }

        const updatedNotification = await this.prisma.notification.update({
            where: { id },
            data: updateNotificationDto,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
                provider: {
                    select: {
                        id: true,
                        businessName: true,
                        businessType: true
                    }
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        type: true
                    }
                }
            }
        });

        return this.mapToResponseDto(updatedNotification);
    }

    /**
     * Obtener notificaciones por usuario (por ID de base de datos)
     */
    async findByUser(userId: string, queryDto: NotificationsByUserDto): Promise<{
        notifications: NotificationResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const queryWithUser = { ...queryDto, userId };
        return this.findAll(queryWithUser);
    }

    /**
     * Marcar notificaciones como leídas
     */
    async markAsRead(markAsReadDto: MarkAsReadDto): Promise<{ updated: number }> {
        const result = await this.prisma.notification.updateMany({
            where: {
                id: { in: markAsReadDto.notificationIds },
                status: NotificationStatus.UNREAD
            },
            data: {
                status: NotificationStatus.READ,
                readAt: new Date()
            }
        });

        return { updated: result.count };
    }

    /**
     * Marcar todas las notificaciones de un usuario como leídas
     */
    async markAllAsRead(userId: string): Promise<{ updated: number }> {
        const result = await this.prisma.notification.updateMany({
            where: {
                userId,
                status: NotificationStatus.UNREAD
            },
            data: {
                status: NotificationStatus.READ,
                readAt: new Date()
            }
        });

        return { updated: result.count };
    }

    /**
     * Eliminar una notificación
     */
    async remove(id: string, userId?: string): Promise<void> {
        const notification = await this.prisma.notification.findUnique({
            where: { id }
        });

        if (!notification) {
            throw new NotFoundException('Notificación no encontrada');
        }

        // Verificar permisos (solo el usuario propietario o admin puede eliminar)
        if (userId && notification.userId !== userId) {
            throw new ForbiddenException('No tienes permisos para eliminar esta notificación');
        }

        await this.prisma.notification.delete({
            where: { id }
        });
    }

    /**
     * Eliminar todas las notificaciones de un usuario
     */
    async removeAllByUser(userId: string): Promise<{ deleted: number }> {
        const result = await this.prisma.notification.deleteMany({
            where: { userId }
        });

        return { deleted: result.count };
    }

    /**
     * Obtener estadísticas de notificaciones
     */
    async getStats(): Promise<{
        totalNotifications: number;
        unreadNotifications: number;
        readNotifications: number;
        notificationsByType: { type: NotificationType; count: number }[];
        notificationsByUser: { userId: string; count: number }[];
    }> {
        const [
            totalNotifications,
            unreadNotifications,
            readNotifications,
            notificationsByType,
            notificationsByUser
        ] = await Promise.all([
            this.prisma.notification.count(),
            this.prisma.notification.count({ where: { status: NotificationStatus.UNREAD } }),
            this.prisma.notification.count({ where: { status: NotificationStatus.READ } }),
            this.prisma.notification.groupBy({
                by: ['type'],
                _count: { type: true },
                orderBy: { _count: { type: 'desc' } }
            }),
            this.prisma.notification.groupBy({
                by: ['userId'],
                _count: { userId: true },
                orderBy: { _count: { userId: 'desc' } },
                take: 10
            })
        ]);

        return {
            totalNotifications,
            unreadNotifications,
            readNotifications,
            notificationsByType: notificationsByType.map(item => ({
                type: item.type,
                count: item._count.type
            })),
            notificationsByUser: notificationsByUser.map(item => ({
                userId: item.userId,
                count: item._count.userId
            }))
        };
    }

    /**
     * Obtener contador de notificaciones no leídas (por ID de base de datos)
     */
    async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
        const count = await this.prisma.notification.count({
            where: {
                userId,
                status: NotificationStatus.UNREAD
            }
        });

        return { unreadCount: count };
    }

    /**
     * Crear notificación de precio bajó
     */
    async createPriceDropNotification(
        userId: string,
        providerId: string,
        serviceId: string,
        oldPrice: number,
        newPrice: number
    ): Promise<NotificationResponseDto | null> {
        const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

        return this.create({
            userId,
            type: NotificationType.PRICE_DROP,
            title: '¡Precio bajó!',
            message: `El servicio bajó de $${oldPrice.toLocaleString()} a $${newPrice.toLocaleString()} (${discount}% de descuento)`,
            providerId,
            serviceId,
            data: {
                oldPrice,
                newPrice,
                discount,
                currency: 'CLP'
            },
            actionUrl: `/providers/${providerId}/services/${serviceId}`
        });
    }

    /**
     * Crear notificación de nueva oferta
     */
    async createNewOfferNotification(
        userId: string,
        providerId: string,
        serviceId: string,
        offerTitle: string,
        offerDescription: string
    ): Promise<NotificationResponseDto | null> {
        return this.create({
            userId,
            type: NotificationType.NEW_OFFER,
            title: '¡Nueva oferta disponible!',
            message: `${offerTitle}: ${offerDescription}`,
            providerId,
            serviceId,
            data: {
                offerTitle,
                offerDescription
            },
            actionUrl: `/providers/${providerId}/services/${serviceId}`
        });
    }

    /**
     * Crear notificación de nuevo proveedor
     */
    async createNewProviderNotification(
        userId: string,
        providerId: string,
        providerName: string
    ): Promise<NotificationResponseDto | null> {
        return this.create({
            userId,
            type: NotificationType.NEW_PROVIDER,
            title: '¡Nuevo autolavado disponible!',
            message: `${providerName} se ha unido a Alto Carwash`,
            providerId,
            data: {
                providerName
            },
            actionUrl: `/providers/${providerId}`
        });
    }

    /**
     * Obtener las preferencias de notificación de un usuario
     */
    async getUserPreferences(userId: string): Promise<any> {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Obtener todas las preferencias del usuario
        const preferences = await this.prisma.notificationPreference.findMany({
            where: { userId },
            orderBy: { type: 'asc' }
        });

        // Crear preferencias por defecto para tipos que no existen
        const allTypes = Object.values(NotificationType);
        const existingTypes = preferences.map(p => p.type);
        const missingTypes = allTypes.filter(type => !existingTypes.includes(type));

        // Crear preferencias faltantes con valor por defecto (habilitadas)
        if (missingTypes.length > 0) {
            await this.prisma.notificationPreference.createMany({
                data: missingTypes.map(type => ({
                    userId,
                    type,
                    enabled: true
                })),
                skipDuplicates: true
            });

            // Volver a obtener todas las preferencias
            const allPreferences = await this.prisma.notificationPreference.findMany({
                where: { userId },
                orderBy: { type: 'asc' }
            });

            return this.mapPreferencesToResponse(allPreferences);
        }

        return this.mapPreferencesToResponse(preferences);
    }

    /**
     * Actualizar una preferencia de notificación
     */
    async updateUserPreference(userId: string, type: NotificationType, enabled: boolean): Promise<any> {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Actualizar o crear la preferencia
        const preference = await this.prisma.notificationPreference.upsert({
            where: {
                userId_type: {
                    userId,
                    type
                }
            },
            update: {
                enabled
            },
            create: {
                userId,
                type,
                enabled
            }
        });

        return {
            id: preference.id,
            userId: preference.userId,
            type: preference.type,
            enabled: preference.enabled,
            createdAt: preference.createdAt,
            updatedAt: preference.updatedAt
        };
    }

    /**
     * Actualizar múltiples preferencias de notificación
     */
    async updateUserPreferences(userId: string, preferences: Record<NotificationType, boolean>): Promise<any> {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Actualizar cada preferencia
        const updates = await Promise.all(
            Object.entries(preferences).map(([type, enabled]) =>
                this.prisma.notificationPreference.upsert({
                    where: {
                        userId_type: {
                            userId,
                            type: type as NotificationType
                        }
                    },
                    update: { enabled },
                    create: {
                        userId,
                        type: type as NotificationType,
                        enabled
                    }
                })
            )
        );

        return this.mapPreferencesToResponse(updates);
    }

    /**
     * Habilitar todas las notificaciones para un usuario
     */
    async enableAllPreferences(userId: string): Promise<any> {
        // Verificar que el usuario existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Actualizar todas las preferencias a habilitadas
        await this.prisma.notificationPreference.updateMany({
            where: { userId },
            data: { enabled: true }
        });

        // Crear preferencias para tipos que no existen
        const allTypes = Object.values(NotificationType);
        for (const type of allTypes) {
            await this.prisma.notificationPreference.upsert({
                where: {
                    userId_type: {
                        userId,
                        type
                    }
                },
                update: { enabled: true },
                create: {
                    userId,
                    type,
                    enabled: true
                }
            });
        }

        return this.getUserPreferences(userId);
    }

    /**
     * Deshabilitar todas las notificaciones para un usuario
     */
    async disableAllPreferences(userId: string): Promise<any> {
        // Verificar que el usuario exists
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Actualizar todas las preferencias a deshabilitadas
        await this.prisma.notificationPreference.updateMany({
            where: { userId },
            data: { enabled: false }
        });

        // Crear preferencias para tipos que no existen
        const allTypes = Object.values(NotificationType);
        for (const type of allTypes) {
            await this.prisma.notificationPreference.upsert({
                where: {
                    userId_type: {
                        userId,
                        type
                    }
                },
                update: { enabled: false },
                create: {
                    userId,
                    type,
                    enabled: false
                }
            });
        }

        return this.getUserPreferences(userId);
    }

    /**
     * Verificar si un usuario tiene habilitado un tipo de notificación
     */
    async isNotificationEnabled(userId: string, type: NotificationType): Promise<boolean> {
        const preference = await this.prisma.notificationPreference.findUnique({
            where: {
                userId_type: {
                    userId,
                    type
                }
            }
        });

        // Si no existe la preferencia, por defecto está habilitada
        return preference ? preference.enabled : true;
    }

    /**
     * Mapear preferencias a respuesta
     */
    private mapPreferencesToResponse(preferences: any[]): any {
        const enabledCount = preferences.filter(p => p.enabled).length;
        const totalCount = preferences.length;

        return {
            preferences: preferences.map(p => ({
                id: p.id,
                userId: p.userId,
                type: p.type,
                enabled: p.enabled,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt
            })),
            allEnabled: enabledCount === totalCount,
            enabledCount,
            totalCount
        };
    }

    /**
     * Mapear entidad de Prisma a DTO de respuesta
     */
    private mapToResponseDto(notification: any): NotificationResponseDto {
        return {
            id: notification.id,
            userId: notification.userId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            providerId: notification.providerId,
            serviceId: notification.serviceId,
            data: notification.data,
            actionUrl: notification.actionUrl,
            status: notification.status,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt,
            readAt: notification.readAt,
            user: notification.user,
            provider: notification.provider,
            service: notification.service
        };
    }
}
