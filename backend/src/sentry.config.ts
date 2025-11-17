/**
 * Sentry Configuration for Backend (v8 API)
 */

import * as Sentry from '@sentry/node';

export function initializeSentry() {
    if (!process.env.SENTRY_DSN) {
        console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: process.env.SENTRY_DSN,

        // Environment
        environment: process.env.NODE_ENV || 'development',

        // Release tracking
        release: process.env.npm_package_version || '1.0.0',

        // Performance Monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Profiling
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Integrations (v8 API)
        integrations: [
            // Enable HTTP tracking
            Sentry.httpIntegration(),
        ],

        // Before send hook to filter sensitive data
        beforeSend(event, hint) {
            // Filter sensitive headers
            if (event.request?.headers) {
                delete event.request.headers['authorization'];
                delete event.request.headers['cookie'];
            }

            // Filter sensitive data from extra context
            if (event.extra) {
                // Remove sensitive fields
                const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
                sensitiveFields.forEach(field => {
                    if (event.extra?.[field]) {
                        event.extra[field] = '[REDACTED]';
                    }
                });
            }

            return event;
        },

        // Breadcrumbs for better error context
        beforeBreadcrumb(breadcrumb, hint) {
            // Filter sensitive data from breadcrumbs
            if (breadcrumb.category === 'http') {
                if (breadcrumb.data?.url?.includes('password')) {
                    breadcrumb.data.url = breadcrumb.data.url.replace(/password=[^&]*/, 'password=[REDACTED]');
                }
            }
            return breadcrumb;
        },

        // Ignore certain errors
        ignoreErrors: [
            'AbortError',
            'Network request failed',
            'Non-Error promise rejection',
        ],

        // Configure tags
        initialScope: {
            tags: {
                'runtime': 'node',
                'server': 'backend',
            },
        },
    });

    console.log('✅ Sentry initialized successfully');
}
