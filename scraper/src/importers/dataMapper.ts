import { CarWashData } from '../types';
import { Prisma } from '@prisma/client';

/**
 * Mapea los datos del scraper al modelo de Usuario de Prisma
 */
export function mapToUserData(carwash: CarWashData): Prisma.UserCreateInput {
    // Generar un email único basado en el nombre del negocio
    const emailSlug = carwash.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remover acentos
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const email = carwash.email || `${emailSlug}@scraped.altocarwash.cl`;

    return {
        email: email,
        firstName: carwash.name.split(' ')[0] || 'Administrador',
        lastName: carwash.name.split(' ').slice(1).join(' ') || 'Autolavado',
        phone: carwash.phone || undefined,
        role: 'PROVIDER',
        status: 'ACTIVE',
    };
}

/**
 * Mapea los datos del scraper al modelo de Provider de Prisma
 */
export function mapToProviderData(
    carwash: CarWashData,
    userId: string
): Omit<Prisma.ProviderCreateInput, 'user'> {
    // Extraer ciudad de la dirección o usar comuna
    const city = carwash.comuna || 'Maipú';
    const region = carwash.region || 'Región Metropolitana';

    // Horarios por defecto si no están disponibles
    const defaultOperatingHours = {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '14:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true },
    };

    // Mapear horarios si están disponibles
    let operatingHours = defaultOperatingHours;
    if (carwash.openingHours && carwash.openingHours.length > 0) {
        const hoursMap: any = {};
        carwash.openingHours.forEach((hour) => {
            const dayKey = hour.day.toLowerCase();
            hoursMap[dayKey] = {
                open: hour.open,
                close: hour.close,
                closed: hour.open === 'Cerrado' || hour.close === 'Cerrado',
            };
        });
        operatingHours = { ...defaultOperatingHours, ...hoursMap };
    }

    return {
        businessName: carwash.name,
        businessType: 'AUTOLAVADO',
        description: carwash.description || `Autolavado en ${city}, ${region}`,
        status: 'APPROVED', // Auto-aprobar datos scrapeados
        phone: carwash.phone || 'Sin teléfono',
        email: carwash.email || `info@${carwash.name.toLowerCase().replace(/\s+/g, '')}.cl`,
        website: carwash.website || undefined,
        address: carwash.address,
        latitude: carwash.latitude || -33.5167, // Coordenadas por defecto de Maipú
        longitude: carwash.longitude || -70.7667,
        city: city,
        region: region,
        postalCode: undefined,
        operatingHours: operatingHours as any,
        businessLicense: undefined,
        taxId: undefined,
        acceptsBookings: true,
        rating: carwash.rating || 0,
        totalReviews: carwash.reviewCount || 0,
        reviewCount: carwash.reviewCount || 0,
    };
}

/**
 * Mapea los servicios del scraper a servicios de Prisma
 */
export function mapToServices(
    carwash: CarWashData,
    providerId: string
): Prisma.ServiceCreateManyInput[] {
    const services: Prisma.ServiceCreateManyInput[] = [];

    // Si hay servicios definidos explícitamente
    if (carwash.services && carwash.services.length > 0) {
        carwash.services.forEach((serviceName, index) => {
            services.push({
                providerId: providerId,
                name: serviceName,
                description: `Servicio de ${serviceName.toLowerCase()}`,
                type: categorizeServiceType(serviceName),
                status: 'ACTIVE',
                price: getPriceForService(carwash, serviceName),
                duration: 60, // 60 minutos por defecto
                isAvailable: true,
                displayOrder: index,
            });
        });
    } else {
        // Servicios por defecto si no hay información
        const defaultServices = [
            { name: 'Lavado Básico', type: 'BASIC_WASH', price: 5000, duration: 30 },
            { name: 'Lavado Premium', type: 'PREMIUM_WASH', price: 10000, duration: 60 },
            { name: 'Encerado', type: 'WAXING', price: 8000, duration: 45 },
        ];

        defaultServices.forEach((service, index) => {
            services.push({
                providerId: providerId,
                name: service.name,
                description: `Servicio de ${service.name.toLowerCase()}`,
                type: service.type as any,
                status: 'ACTIVE',
                price: service.price,
                duration: service.duration,
                isAvailable: true,
                displayOrder: index,
            });
        });
    }

    return services;
}

/**
 * Categoriza el tipo de servicio basado en el nombre
 */
function categorizeServiceType(serviceName: string): string {
    const name = serviceName.toLowerCase();

    if (name.includes('básico') || name.includes('basico') || name.includes('simple')) {
        return 'BASIC_WASH';
    }
    if (name.includes('premium') || name.includes('completo') || name.includes('full')) {
        return 'PREMIUM_WASH';
    }
    if (name.includes('encerado') || name.includes('cera') || name.includes('wax')) {
        return 'WAXING';
    }
    if (name.includes('pulido') || name.includes('polish')) {
        return 'POLISHING';
    }
    if (name.includes('interior') || name.includes('tapicería')) {
        return 'INTERIOR_CLEANING';
    }
    if (name.includes('motor') || name.includes('engine')) {
        return 'ENGINE_CLEANING';
    }
    if (name.includes('detailing') || name.includes('detallado')) {
        return 'DETAILING';
    }

    return 'OTHER';
}

/**
 * Obtiene el precio de un servicio desde los datos scrapeados
 */
function getPriceForService(carwash: CarWashData, serviceName: string): number {
    // Si hay precios definidos, buscar el correspondiente
    if (carwash.prices && carwash.prices.length > 0) {
        const priceInfo = carwash.prices.find(
            (p) => p.serviceName.toLowerCase() === serviceName.toLowerCase()
        );
        if (priceInfo) {
            return priceInfo.price;
        }
    }

    // Precios por defecto según el tipo de servicio
    const name = serviceName.toLowerCase();
    if (name.includes('básico') || name.includes('basico')) return 5000;
    if (name.includes('premium') || name.includes('completo')) return 12000;
    if (name.includes('encerado')) return 8000;
    if (name.includes('pulido')) return 15000;
    if (name.includes('interior')) return 10000;
    if (name.includes('motor')) return 7000;
    if (name.includes('detailing')) return 25000;

    return 8000; // Precio por defecto
}

/**
 * Valida que los datos del carwash sean válidos para importar
 */
export function validateCarWashData(carwash: CarWashData): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    if (!carwash.name || carwash.name.trim() === '') {
        errors.push('El nombre es requerido');
    }

    if (!carwash.address || carwash.address.trim() === '') {
        errors.push('La dirección es requerida');
    }

    if (!carwash.latitude || !carwash.longitude) {
        errors.push('Las coordenadas son requeridas');
    }

    if (carwash.latitude && (carwash.latitude < -90 || carwash.latitude > 90)) {
        errors.push('Latitud inválida');
    }

    if (carwash.longitude && (carwash.longitude < -180 || carwash.longitude > 180)) {
        errors.push('Longitud inválida');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
