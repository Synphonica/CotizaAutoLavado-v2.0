import { z } from 'zod';

/**
 * Schema de validación para crear una reserva
 */
export const createBookingSchema = z.object({
    serviceId: z.string().uuid({
        message: 'Debe seleccionar un servicio válido',
    }),
    providerId: z.string().uuid({
        message: 'Debe seleccionar un proveedor válido',
    }),
    startDateTime: z
        .string()
        .datetime({ message: 'Fecha y hora de inicio inválida' })
        .refine(
            (date) => new Date(date) > new Date(),
            'La fecha debe ser futura'
        )
        .refine(
            (date) => {
                const bookingDate = new Date(date);
                const minDate = new Date();
                minDate.setHours(minDate.getHours() + 1); // Mínimo 1 hora de anticipación
                return bookingDate >= minDate;
            },
            'Debe reservar con al menos 1 hora de anticipación'
        )
        .refine(
            (date) => {
                const bookingDate = new Date(date);
                const maxDate = new Date();
                maxDate.setDate(maxDate.getDate() + 60); // Máximo 60 días
                return bookingDate <= maxDate;
            },
            'No se pueden hacer reservas con más de 60 días de anticipación'
        ),
    endDateTime: z
        .string()
        .datetime({ message: 'Fecha y hora de fin inválida' }),
    totalPrice: z
        .number()
        .min(1000, 'El precio mínimo es $1,000')
        .max(1000000, 'El precio máximo es $1,000,000'),
    notes: z
        .string()
        .max(500, 'Las notas no pueden exceder 500 caracteres')
        .optional(),
}).refine(
    (data) => new Date(data.endDateTime) > new Date(data.startDateTime),
    {
        message: 'La hora de fin debe ser posterior a la hora de inicio',
        path: ['endDateTime'],
    }
);

/**
 * Schema para cancelar reserva
 */
export const cancelBookingSchema = z.object({
    cancellationReason: z
        .string()
        .min(10, 'El motivo debe tener al menos 10 caracteres')
        .max(500, 'El motivo no puede exceder 500 caracteres'),
});

/**
 * Schema para reprogramar reserva
 */
export const rescheduleBookingSchema = z.object({
    newStartDateTime: z
        .string()
        .datetime({ message: 'Fecha y hora inválida' })
        .refine(
            (date) => new Date(date) > new Date(),
            'La nueva fecha debe ser futura'
        ),
    newEndDateTime: z
        .string()
        .datetime({ message: 'Fecha y hora inválida' }),
    reason: z
        .string()
        .max(500, 'El motivo no puede exceder 500 caracteres')
        .optional(),
}).refine(
    (data) => new Date(data.newEndDateTime) > new Date(data.newStartDateTime),
    {
        message: 'La hora de fin debe ser posterior a la hora de inicio',
        path: ['newEndDateTime'],
    }
);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
