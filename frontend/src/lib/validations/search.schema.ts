import { z } from 'zod';

/**
 * Schema de validación para búsqueda de servicios
 */
export const searchSchema = z
    .object({
        query: z
            .string()
            .min(2, 'La búsqueda debe tener al menos 2 caracteres')
            .max(100, 'La búsqueda no puede exceder 100 caracteres')
            .optional(),
        latitude: z
            .number()
            .min(-90, 'Latitud inválida (mínimo -90)')
            .max(90, 'Latitud inválida (máximo 90)')
            .optional(),
        longitude: z
            .number()
            .min(-180, 'Longitud inválida (mínimo -180)')
            .max(180, 'Longitud inválida (máximo 180)')
            .optional(),
        radius: z
            .number()
            .min(1, 'El radio mínimo es 1 km')
            .max(100, 'El radio máximo es 100 km')
            .default(10),
        minPrice: z
            .number()
            .min(0, 'El precio mínimo no puede ser negativo')
            .max(1000000, 'El precio mínimo no puede exceder $1,000,000')
            .optional(),
        maxPrice: z
            .number()
            .min(0, 'El precio máximo no puede ser negativo')
            .max(1000000, 'El precio máximo no puede exceder $1,000,000')
            .optional(),
        minRating: z
            .number()
            .min(1, 'La calificación mínima es 1')
            .max(5, 'La calificación máxima es 5')
            .optional(),
        sortBy: z
            .enum(['distance', 'price', 'rating', 'relevance'])
            .default('relevance'),
        sortOrder: z.enum(['asc', 'desc']).default('asc'),
        page: z.number().int().min(1, 'La página debe ser mayor a 0').default(1),
        limit: z
            .number()
            .int()
            .min(1, 'El límite debe ser mayor a 0')
            .max(100, 'El límite máximo es 100')
            .default(20),
    })
    .refine(
        (data) => {
            // Si se proporciona latitud, longitud también debe estar presente
            if (data.latitude !== undefined && data.longitude === undefined) {
                return false;
            }
            if (data.longitude !== undefined && data.latitude === undefined) {
                return false;
            }
            return true;
        },
        {
            message:
                'Latitud y longitud deben proporcionarse juntas para búsqueda por ubicación',
            path: ['latitude'],
        }
    )
    .refine(
        (data) => {
            // Si minPrice y maxPrice están definidos, minPrice debe ser menor que maxPrice
            if (
                data.minPrice !== undefined &&
                data.maxPrice !== undefined &&
                data.minPrice > data.maxPrice
            ) {
                return false;
            }
            return true;
        },
        {
            message: 'El precio mínimo debe ser menor al precio máximo',
            path: ['minPrice'],
        }
    );

/**
 * Schema para comparación de servicios
 */
export const compareServicesSchema = z.object({
    serviceIds: z
        .array(z.string().uuid('ID de servicio inválido'))
        .min(2, 'Debe seleccionar al menos 2 servicios para comparar')
        .max(5, 'Puede comparar hasta 5 servicios como máximo'),
    savingsAnalysis: z.boolean().default(true),
});

export type SearchInput = z.infer<typeof searchSchema>;
export type CompareServicesInput = z.infer<typeof compareServicesSchema>;
