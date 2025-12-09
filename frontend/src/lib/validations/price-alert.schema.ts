import { z } from 'zod';

/**
 * Schema de validación para alertas de precio
 */
export const createPriceAlertSchema = z
    .object({
        serviceId: z.string().uuid({
            message: 'Debe seleccionar un servicio válido',
        }),
        targetPrice: z
            .number()
            .min(1000, 'El precio objetivo mínimo es $1,000')
            .max(1000000, 'El precio objetivo máximo es $1,000,000')
            .optional(),
        percentageOff: z
            .number()
            .min(5, 'El porcentaje de descuento mínimo es 5%')
            .max(90, 'El porcentaje de descuento máximo es 90%')
            .optional(),
        notifyEmail: z.boolean().default(true),
        notifyInApp: z.boolean().default(true),
    })
    .refine(
        (data) => data.targetPrice !== undefined || data.percentageOff !== undefined,
        {
            message: 'Debe especificar un precio objetivo o porcentaje de descuento',
            path: ['targetPrice'],
        }
    )
    .refine((data) => data.notifyEmail || data.notifyInApp, {
        message: 'Debe seleccionar al menos un método de notificación',
        path: ['notifyEmail'],
    });

/**
 * Schema para actualizar alerta de precio
 */
export const updatePriceAlertSchema = z.object({
    targetPrice: z
        .number()
        .min(1000, 'El precio objetivo mínimo es $1,000')
        .max(1000000, 'El precio objetivo máximo es $1,000,000')
        .optional(),
    percentageOff: z
        .number()
        .min(5, 'El porcentaje de descuento mínimo es 5%')
        .max(90, 'El porcentaje de descuento máximo es 90%')
        .optional(),
    notifyEmail: z.boolean().optional(),
    notifyInApp: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

export type CreatePriceAlertInput = z.infer<typeof createPriceAlertSchema>;
export type UpdatePriceAlertInput = z.infer<typeof updatePriceAlertSchema>;
