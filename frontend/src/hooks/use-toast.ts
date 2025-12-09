import { toast as sonnerToast, type ExternalToast } from 'sonner';

/**
 * Hook personalizado para manejar notificaciones toast
 * Wrapper sobre sonner con configuración predeterminada
 */
export const useToast = () => {
    const defaultOptions: ExternalToast = {
        duration: 4000,
        position: 'top-right',
    };

    const toast = {
        success: (message: string, options?: ExternalToast) => {
            return sonnerToast.success(message, { ...defaultOptions, ...options });
        },

        error: (message: string, options?: ExternalToast) => {
            return sonnerToast.error(message, {
                ...defaultOptions,
                duration: 6000, // Errores duran más
                ...options,
            });
        },

        warning: (message: string, options?: ExternalToast) => {
            return sonnerToast.warning(message, { ...defaultOptions, ...options });
        },

        info: (message: string, options?: ExternalToast) => {
            return sonnerToast.info(message, { ...defaultOptions, ...options });
        },

        loading: (message: string, options?: ExternalToast) => {
            return sonnerToast.loading(message, {
                ...defaultOptions,
                duration: Infinity,
                ...options,
            });
        },

        promise: <T,>(
            promise: Promise<T>,
            messages: {
                loading: string;
                success: string | ((data: T) => string);
                error: string | ((error: Error) => string);
            },
            options?: ExternalToast
        ) => {
            return sonnerToast.promise(promise, messages);
        },

        custom: (jsx: (id: number | string) => React.ReactElement, options?: ExternalToast) => {
            return sonnerToast.custom(jsx, { ...defaultOptions, ...options });
        },

        dismiss: (id?: number | string) => {
            return sonnerToast.dismiss(id);
        },
    };

    return toast;
};

/**
 * Mensajes de toast predefinidos para errores comunes
 */
export const toastMessages = {
    // Errores de red
    networkError: 'Error de conexión. Por favor, verifica tu internet.',
    serverError: 'Error del servidor. Intenta nuevamente más tarde.',
    timeout: 'La solicitud tardó demasiado. Intenta nuevamente.',

    // Errores de validación
    invalidForm: 'Por favor, corrige los errores en el formulario.',
    requiredFields: 'Todos los campos obligatorios deben completarse.',

    // Autenticación
    unauthorized: 'Debes iniciar sesión para continuar.',
    sessionExpired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
    forbidden: 'No tienes permisos para realizar esta acción.',

    // Bookings
    bookingCreated: '¡Reserva creada exitosamente!',
    bookingCancelled: 'Reserva cancelada correctamente.',
    bookingRescheduled: 'Reserva reprogramada exitosamente.',
    bookingError: 'Error al procesar la reserva. Intenta nuevamente.',

    // Búsqueda
    searchError: 'Error al realizar la búsqueda. Intenta nuevamente.',
    noResults: 'No se encontraron resultados para tu búsqueda.',

    // Alertas de precio
    alertCreated: '¡Alerta de precio creada! Te notificaremos cuando el precio baje.',
    alertDeleted: 'Alerta de precio eliminada.',
    alertError: 'Error al gestionar la alerta de precio.',

    // Favoritos
    addedToFavorites: 'Agregado a favoritos.',
    removedFromFavorites: 'Eliminado de favoritos.',

    // Reseñas
    reviewSubmitted: '¡Gracias por tu reseña!',
    reviewError: 'Error al enviar la reseña. Intenta nuevamente.',

    // Genérico
    success: 'Operación completada exitosamente.',
    error: 'Ocurrió un error. Por favor, intenta nuevamente.',
    copied: 'Copiado al portapapeles.',
} as const;
