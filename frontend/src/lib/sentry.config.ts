/**
 * Sentry Configuration for Frontend (Next.js v8 API)
 */

import * as Sentry from '@sentry/nextjs';

export function initializeSentry() {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
        console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

        // Environment
        environment: process.env.NEXT_PUBLIC_ENV || 'development',

        // Adjust this value in production
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Session Replay
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,

        // Integrations (v8 API)
        integrations: [
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],

        // Before send hook
        beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint) {
            // Filter sensitive data
            if (event.request?.headers) {
                delete event.request.headers['authorization'];
                delete event.request.headers['cookie'];
            }

            // Filter localStorage/sessionStorage
            if (event.extra) {
                delete event.extra['localStorage'];
                delete event.extra['sessionStorage'];
            }

            return event;
        },

        // Ignore certain errors
        ignoreErrors: [
            // Browser errors
            'ResizeObserver loop limit exceeded',
            'ResizeObserver loop completed with undelivered notifications',

            // Network errors
            'NetworkError',
            'Failed to fetch',

            // Third-party errors
            'Non-Error promise rejection',
        ],

        // Configure tags
        initialScope: {
            tags: {
                'runtime': 'browser',
                'app': 'frontend',
            },
        },
    });

    console.log('✅ Sentry initialized successfully');
}
