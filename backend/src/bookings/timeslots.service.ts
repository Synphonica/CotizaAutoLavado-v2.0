import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTimeSlotDto {
    providerId: string;
    dayOfWeek: number; // 0-6 (0 = Domingo)
    startTime: string; // "09:00"
    endTime: string; // "18:00"
    isAvailable?: boolean;
    maxCapacity?: number;
}

export interface CreateBlockedDateDto {
    providerId: string;
    date: string; // ISO date
    reason?: string;
    isAllDay?: boolean;
    startTime?: string;
    endTime?: string;
}

@Injectable()
export class TimeSlotsService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Crear un time slot para un proveedor
     */
    async createTimeSlot(dto: CreateTimeSlotDto) {
        // Validar día de la semana
        if (dto.dayOfWeek < 0 || dto.dayOfWeek > 6) {
            throw new BadRequestException('El día de la semana debe estar entre 0 (Domingo) y 6 (Sábado)');
        }

        // Validar formato de horas
        if (!this.isValidTimeFormat(dto.startTime) || !this.isValidTimeFormat(dto.endTime)) {
            throw new BadRequestException('Formato de hora inválido. Use HH:MM (ej: 09:00)');
        }

        // Validar que startTime < endTime
        if (dto.startTime >= dto.endTime) {
            throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
        }

        // Verificar que el proveedor existe
        const provider = await this.prisma.provider.findUnique({
            where: { id: dto.providerId }
        });

        if (!provider) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        // Crear el time slot
        return await this.prisma.timeSlot.create({
            data: {
                providerId: dto.providerId,
                dayOfWeek: dto.dayOfWeek,
                startTime: dto.startTime,
                endTime: dto.endTime,
                isAvailable: dto.isAvailable ?? true,
                maxCapacity: dto.maxCapacity ?? 1,
            },
        });
    }

    /**
     * Obtener todos los time slots de un proveedor
     */
    async getProviderTimeSlots(providerId: string) {
        return await this.prisma.timeSlot.findMany({
            where: { providerId },
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });
    }

    /**
     * Obtener time slots por día de la semana
     */
    async getTimeSlotsByDay(providerId: string, dayOfWeek: number) {
        return await this.prisma.timeSlot.findMany({
            where: {
                providerId,
                dayOfWeek,
            },
            orderBy: { startTime: 'asc' },
        });
    }

    /**
     * Actualizar un time slot
     */
    async updateTimeSlot(id: string, updateData: Partial<CreateTimeSlotDto>) {
        const timeSlot = await this.prisma.timeSlot.findUnique({
            where: { id },
        });

        if (!timeSlot) {
            throw new NotFoundException('Time slot no encontrado');
        }

        // Validaciones si se actualizan las horas
        if (updateData.startTime && updateData.endTime) {
            if (!this.isValidTimeFormat(updateData.startTime) || !this.isValidTimeFormat(updateData.endTime)) {
                throw new BadRequestException('Formato de hora inválido');
            }
            if (updateData.startTime >= updateData.endTime) {
                throw new BadRequestException('La hora de inicio debe ser anterior a la hora de fin');
            }
        }

        return await this.prisma.timeSlot.update({
            where: { id },
            data: updateData,
        });
    }

    /**
     * Eliminar un time slot
     */
    async deleteTimeSlot(id: string) {
        return await this.prisma.timeSlot.delete({
            where: { id },
        });
    }

    /**
     * Crear una fecha bloqueada
     */
    async createBlockedDate(dto: CreateBlockedDateDto) {
        const provider = await this.prisma.provider.findUnique({
            where: { id: dto.providerId },
        });

        if (!provider) {
            throw new NotFoundException('Proveedor no encontrado');
        }

        const date = new Date(dto.date);
        if (isNaN(date.getTime())) {
            throw new BadRequestException('Fecha inválida');
        }

        // Verificar que no exista ya un bloqueo para esa fecha
        const existing = await this.prisma.blockedDate.findFirst({
            where: {
                providerId: dto.providerId,
                date: {
                    gte: new Date(date.setHours(0, 0, 0, 0)),
                    lte: new Date(date.setHours(23, 59, 59, 999)),
                },
            },
        });

        if (existing) {
            throw new ConflictException('Ya existe un bloqueo para esta fecha');
        }

        return await this.prisma.blockedDate.create({
            data: {
                providerId: dto.providerId,
                date: new Date(dto.date),
                reason: dto.reason,
                isAllDay: dto.isAllDay ?? true,
                startTime: dto.startTime,
                endTime: dto.endTime,
            },
        });
    }

    /**
     * Obtener fechas bloqueadas de un proveedor
     */
    async getProviderBlockedDates(providerId: string, startDate?: string, endDate?: string) {
        const where: any = { providerId };

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        return await this.prisma.blockedDate.findMany({
            where,
            orderBy: { date: 'asc' },
        });
    }

    /**
     * Eliminar una fecha bloqueada
     */
    async deleteBlockedDate(id: string) {
        return await this.prisma.blockedDate.delete({
            where: { id },
        });
    }

    /**
     * Validar formato de hora HH:MM
     */
    private isValidTimeFormat(time: string): boolean {
        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return regex.test(time);
    }

    /**
     * Crear time slots por defecto para un proveedor nuevo
     */
    async createDefaultTimeSlots(providerId: string) {
        const defaultSlots: CreateTimeSlotDto[] = [
            // Lunes a Viernes: 9:00 - 18:00
            { providerId, dayOfWeek: 1, startTime: '09:00', endTime: '18:00', maxCapacity: 2 },
            { providerId, dayOfWeek: 2, startTime: '09:00', endTime: '18:00', maxCapacity: 2 },
            { providerId, dayOfWeek: 3, startTime: '09:00', endTime: '18:00', maxCapacity: 2 },
            { providerId, dayOfWeek: 4, startTime: '09:00', endTime: '18:00', maxCapacity: 2 },
            { providerId, dayOfWeek: 5, startTime: '09:00', endTime: '18:00', maxCapacity: 2 },
            // Sábado: 9:00 - 14:00
            { providerId, dayOfWeek: 6, startTime: '09:00', endTime: '14:00', maxCapacity: 1 },
            // Domingo: Cerrado (no crear slot)
        ];

        const createdSlots: any[] = [];
        for (const slot of defaultSlots) {
            try {
                const created = await this.createTimeSlot(slot);
                createdSlots.push(created);
            } catch (error) {
                console.error(`Error creando slot para día ${slot.dayOfWeek}:`, error.message);
            }
        }

        return createdSlots;
    }
}
