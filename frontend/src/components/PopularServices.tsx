// ============================================
// POPULAR SERVICES - Componente con datos reales del backend
// ============================================

'use client';

import { usePopularServices } from '@/hooks/useServices';
import { ServiceCard, type ServiceItem } from '@/components/ServiceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, TrendingUp } from 'lucide-react';
import type { Service } from '@/types/api.types';

interface PopularServicesProps {
    limit?: number;
}

/**
 * Convertir Service del backend a ServiceItem del componente
 */
function mapServiceToItem(service: Service): ServiceItem {
    return {
        id: service.id,
        name: service.name,
        price: service.basePrice,
        provider: {
            id: service.providerId,
            businessName: service.provider?.businessName || 'Proveedor',
            city: service.provider?.city,
        },
        rating: service.averageRating,
        duration: service.duration,
        description: service.description,
        images: service.imageUrls,
        category: service.category,
    };
}

export function PopularServices({ limit = 6 }: PopularServicesProps) {
    const { data: services, isLoading, error } = usePopularServices(limit);

    // Estado de carga
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: limit }).map((_, index) => (
                    <div key={index} className="space-y-3">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                ))}
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Error al cargar servicios populares. Por favor, intenta nuevamente.
                </AlertDescription>
            </Alert>
        );
    }

    // Sin servicios
    if (!services || services.length === 0) {
        return (
            <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                    No hay servicios disponibles en este momento.
                </AlertDescription>
            </Alert>
        );
    }

    // Renderizar servicios
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: Service, index: number) => (
                <ServiceCard
                    key={service.id}
                    item={mapServiceToItem(service)}
                    index={index}
                />
            ))}
        </div>
    );
}
