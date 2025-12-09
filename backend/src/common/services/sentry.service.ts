import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

@Injectable()
export class SentryService implements OnModuleInit {
    private isInitialized = false;

    onModuleInit() {
        this.initialize();
    }

    initialize() {
        if (this.isInitialized) {
            return;
        }

        const sentryDsn = process.env.SENTRY_DSN;

        if (!sentryDsn) {
            console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
            return;
        }

        Sentry.init({
            dsn: sentryDsn,
            environment: process.env.NODE_ENV || 'development',

            // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
            // We recommend adjusting this value in production
            tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

            // Capture 100% of profile samples in development, 10% in production
            profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

            integrations: [
                // Enable profiling
                nodeProfilingIntegration(),
            ],            // Opciones adicionales
            maxBreadcrumbs: 50,
            attachStacktrace: true,

            // Filtrar información sensible
            beforeSend(event) {
                // Eliminar headers sensibles
                if (event.request?.headers) {
                    delete event.request.headers['authorization'];
                    delete event.request.headers['cookie'];
                }

                // Eliminar datos sensibles de contextos
                if (event.contexts?.user) {
                    delete event.contexts.user.email;
                    delete event.contexts.user.ip_address;
                }

                return event;
            },
        });

        this.isInitialized = true;
        console.log('✓ Sentry initialized successfully');
    }

    /**
     * Capturar una excepción manualmente
     */
    captureException(exception: any, context?: Record<string, any>) {
        if (!this.isInitialized) return;

        Sentry.captureException(exception, {
            contexts: context,
        });
    }

    /**
     * Capturar un mensaje
     */
    captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
        if (!this.isInitialized) return;

        Sentry.captureMessage(message, {
            level,
            contexts: context,
        });
    }

    /**
     * Agregar breadcrumb para tracking de eventos
     */
    addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
        if (!this.isInitialized) return;

        Sentry.addBreadcrumb(breadcrumb);
    }

    /**
     * Configurar contexto de usuario
     */
    setUser(user: { id: string; email?: string; username?: string }) {
        if (!this.isInitialized) return;

        Sentry.setUser({
            id: user.id,
            username: user.username,
            // No incluir email por privacidad
        });
    }

    /**
     * Limpiar contexto de usuario
     */
    clearUser() {
        if (!this.isInitialized) return;

        Sentry.setUser(null);
    }

    /**
     * Agregar tags personalizados
     */
    setTag(key: string, value: string) {
        if (!this.isInitialized) return;

        Sentry.setTag(key, value);
    }

    /**
     * Agregar contexto extra
     */
    setContext(name: string, context: Record<string, any>) {
        if (!this.isInitialized) return;

        Sentry.setContext(name, context);
    }

    /**
     * Iniciar una transacción de performance
     * Nota: En versiones modernas de Sentry, usar startSpan en su lugar
     */
    startSpan(name: string, op: string, callback: () => void) {
        if (!this.isInitialized) return null;

        return Sentry.startSpan({
            name,
            op,
        }, callback);
    }    /**
     * Flush de eventos pendientes (útil antes de cerrar la aplicación)
     */
    async flush(timeout: number = 2000): Promise<boolean> {
        if (!this.isInitialized) return true;

        return Sentry.close(timeout);
    }
}
