import { SetMetadata } from '@nestjs/common';

export const SENTRY_BREADCRUMB_KEY = 'sentry:breadcrumb';

/**
 * Decorator para agregar breadcrumbs de Sentry automáticamente
 * @param category - Categoría del breadcrumb
 * @param message - Mensaje descriptivo
 */
export const SentryBreadcrumb = (category: string, message?: string) =>
    SetMetadata(SENTRY_BREADCRUMB_KEY, { category, message });

/**
 * Decorator para marcar endpoints que deben ser monitoreados por Sentry
 */
export const MonitorPerformance = () => SetMetadata('sentry:monitor', true);
