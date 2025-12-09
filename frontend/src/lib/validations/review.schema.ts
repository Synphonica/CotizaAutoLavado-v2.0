import { z } from 'zod';

/**
 * Schema de validación para reseñas
 */
export const createReviewSchema = z.object({
    bookingId: z.string().uuid({
        message: 'ID de reserva inválido',
    }),
    providerId: z.string().uuid({
        message: 'ID de proveedor inválido',
    }),
    rating: z
        .number()
        .int('La calificación debe ser un número entero')
        .min(1, 'La calificación mínima es 1 estrella')
        .max(5, 'La calificación máxima es 5 estrellas'),
    comment: z
        .string()
        .min(10, 'El comentario debe tener al menos 10 caracteres')
        .max(1000, 'El comentario no puede exceder 1000 caracteres')
        .optional(),
    photos: z
        .array(
            z.object({
                url: z.string().url('URL de foto inválida'),
                order: z.number().int().min(0),
            })
        )
        .max(5, 'Puede subir hasta 5 fotos')
        .optional(),
});

/**
 * Schema para actualizar reseña
 */
export const updateReviewSchema = z.object({
    rating: z
        .number()
        .int('La calificación debe ser un número entero')
        .min(1, 'La calificación mínima es 1 estrella')
        .max(5, 'La calificación máxima es 5 estrellas')
        .optional(),
    comment: z
        .string()
        .min(10, 'El comentario debe tener al menos 10 caracteres')
        .max(1000, 'El comentario no puede exceder 1000 caracteres')
        .optional(),
});

/**
 * Schema para reportar reseña
 */
export const reportReviewSchema = z.object({
    reviewId: z.string().uuid({
        message: 'ID de reseña inválido',
    }),
    category: z.enum(['SPAM', 'OFFENSIVE', 'FAKE']),
    reason: z
        .string()
        .min(20, 'El motivo debe tener al menos 20 caracteres')
        .max(500, 'El motivo no puede exceder 500 caracteres'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReportReviewInput = z.infer<typeof reportReviewSchema>;
