import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ciudades de Chile con sus regiones
const CITIES_BY_REGION = {
    'Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'Ñuñoa', 'La Reina', 'Maipú', 'Peñalolén', 'La Florida', 'Puente Alto', 'San Miguel', 'Independencia', 'Recoleta', 'Quinta Normal', 'Estación Central'],
    'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Quillota'],
    'Biobío': ['Concepción', 'Talcahuano', 'Los Ángeles', 'Chillán', 'Coronel'],
    'Araucanía': ['Temuco', 'Villarrica', 'Pucón', 'Angol'],
    'Los Lagos': ['Puerto Montt', 'Osorno', 'Castro', 'Ancud'],
    'Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle'],
    'Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla'],
    "O'Higgins": ['Rancagua', 'San Fernando', 'Rengo'],
    'Maule': ['Talca', 'Curicó', 'Linares'],
    'Arica y Parinacota': ['Arica'],
    'Tarapacá': ['Iquique', 'Alto Hospicio'],
    'Aysén': ['Coyhaique', 'Puerto Aysén'],
    'Magallanes': ['Punta Arenas', 'Puerto Natales'],
    'Los Ríos': ['Valdivia', 'La Unión'],
};

// Tipos de servicios con precios base
const SERVICE_TYPES = [
    { name: 'Lavado Exterior Básico', basePrice: 5000, duration: 30, category: 'lavado_exterior', type: 'BASIC_WASH' },
    { name: 'Lavado Exterior Premium', basePrice: 12000, duration: 45, category: 'lavado_exterior', type: 'PREMIUM_WASH' },
    { name: 'Lavado Exterior Completo', basePrice: 15000, duration: 60, category: 'lavado_exterior', type: 'PREMIUM_WASH' },
    { name: 'Lavado Interior Básico', basePrice: 8000, duration: 40, category: 'lavado_interior', type: 'INTERIOR_CLEAN' },
    { name: 'Lavado Interior Premium', basePrice: 15000, duration: 60, category: 'lavado_interior', type: 'INTERIOR_CLEAN' },
    { name: 'Lavado Interior Profundo', basePrice: 20000, duration: 90, category: 'lavado_interior', type: 'INTERIOR_CLEAN' },
    { name: 'Lavado Completo Básico', basePrice: 18000, duration: 60, category: 'lavado_completo', type: 'PREMIUM_WASH' },
    { name: 'Lavado Completo Premium', basePrice: 25000, duration: 90, category: 'lavado_completo', type: 'PREMIUM_WASH' },
    { name: 'Lavado Completo + Encerado', basePrice: 30000, duration: 120, category: 'lavado_completo', type: 'WAXING' },
    { name: 'Detailing Básico', basePrice: 25000, duration: 90, category: 'detailing', type: 'DETAILING' },
    { name: 'Detailing Completo', basePrice: 40000, duration: 150, category: 'detailing', type: 'DETAILING' },
    { name: 'Detailing Premium', basePrice: 60000, duration: 180, category: 'detailing', type: 'DETAILING' },
    { name: 'Encerado Básico', basePrice: 15000, duration: 60, category: 'encerado', type: 'WAXING' },
    { name: 'Encerado Premium', basePrice: 25000, duration: 90, category: 'encerado', type: 'WAXING' },
    { name: 'Pulido Simple', basePrice: 20000, duration: 90, category: 'pulido', type: 'PAINT_PROTECTION' },
    { name: 'Pulido + Encerado', basePrice: 35000, duration: 120, category: 'pulido', type: 'PAINT_PROTECTION' },
    { name: 'Pulido Profesional', basePrice: 50000, duration: 180, category: 'pulido', type: 'PAINT_PROTECTION' },
    { name: 'Limpieza de Tapiz', basePrice: 10000, duration: 45, category: 'tapizado', type: 'INTERIOR_CLEAN' },
    { name: 'Limpieza de Cuero', basePrice: 18000, duration: 60, category: 'tapizado', type: 'INTERIOR_CLEAN' },
    { name: 'Aspirado Premium', basePrice: 6000, duration: 20, category: 'aspirado', type: 'INTERIOR_CLEAN' },
    { name: 'Lavado de Motor', basePrice: 12000, duration: 45, category: 'motor', type: 'ENGINE_CLEAN' },
    { name: 'Descontaminación de Pintura', basePrice: 30000, duration: 120, category: 'detailing', type: 'PAINT_PROTECTION' },
    { name: 'Tratamiento Cerámico', basePrice: 80000, duration: 240, category: 'detailing', type: 'CERAMIC_COATING' },
    { name: 'Restauración de Faros', basePrice: 15000, duration: 60, category: 'otros', type: 'DETAILING' },
    { name: 'Ozono Antibacterial', basePrice: 20000, duration: 45, category: 'otros', type: 'INTERIOR_CLEAN' },
];// Nombres de negocios
const BUSINESS_PREFIXES = [
    'Auto', 'Car', 'Eco', 'Express', 'Premium', 'Ultra', 'Clean', 'Shine', 'Wash', 'Detail',
    'Perfect', 'Master', 'Pro', 'Super', 'Total', 'Royal', 'Elite', 'Smart', 'Quick', 'Speed'
];

const BUSINESS_SUFFIXES = [
    'Clean', 'Wash', 'Spa', 'Center', 'Service', 'Care', 'Shine', 'Detail', 'Auto', 'Pro',
    'Plus', 'Master', 'Express', 'Premium', 'Station', 'Point', 'Zone', 'Hub', 'Lab', 'Studio'
];

// Generar nombre de negocio único
function generateBusinessName(city: string, index: number): string {
    const prefix = BUSINESS_PREFIXES[index % BUSINESS_PREFIXES.length];
    const suffix = BUSINESS_SUFFIXES[Math.floor(index / BUSINESS_PREFIXES.length) % BUSINESS_SUFFIXES.length];
    return `${prefix} ${suffix} ${city}`;
}

// Generar RUT chileno válido
function generateRUT(base: number): string {
    const rut = 76000000 + base;
    const rutStr = rut.toString();
    let sum = 0;
    let multiplier = 2;

    for (let i = rutStr.length - 1; i >= 0; i--) {
        sum += parseInt(rutStr[i]) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const dv = 11 - (sum % 11);
    const dvStr = dv === 11 ? '0' : dv === 10 ? 'K' : dv.toString();

    return `${rut}-${dvStr}`;
}

// Generar coordenadas aleatorias para Chile
function generateCoordinates(city: string): { lat: number; lng: number } {
    const cityCoords: { [key: string]: { lat: number; lng: number } } = {
        'Santiago': { lat: -33.4489, lng: -70.6693 },
        'Valparaíso': { lat: -33.0472, lng: -71.6127 },
        'Concepción': { lat: -36.8201, lng: -73.0444 },
        'La Serena': { lat: -29.9027, lng: -71.2519 },
        'Antofagasta': { lat: -23.6509, lng: -70.3975 },
        'Temuco': { lat: -38.7359, lng: -72.5904 },
        'Rancagua': { lat: -34.1705, lng: -70.7407 },
        'Talca': { lat: -35.4264, lng: -71.6554 },
        'Arica': { lat: -18.4746, lng: -70.2979 },
        'Iquique': { lat: -20.2307, lng: -70.1355 },
        'Puerto Montt': { lat: -41.4693, lng: -72.9424 },
        'Coyhaique': { lat: -45.5752, lng: -72.0662 },
        'Punta Arenas': { lat: -53.1638, lng: -70.9171 },
    };

    const baseCoords = cityCoords[city] || { lat: -33.4489, lng: -70.6693 };

    // Agregar variación aleatoria (±0.05 grados ≈ 5km)
    return {
        lat: +(baseCoords.lat + (Math.random() - 0.5) * 0.1).toFixed(6),
        lng: +(baseCoords.lng + (Math.random() - 0.5) * 0.1).toFixed(6),
    };
}

async function main() {
    console.log('🚀 Iniciando generación masiva de datos...\n');
    console.log('⏱️  Esto puede tomar varios minutos...\n');

    const startTime = Date.now();

    // 1. Limpiar datos existentes (opcional)
    console.log('🗑️  Limpiando datos anteriores...');
    await prisma.service.deleteMany({});
    await prisma.provider.deleteMany({});
    await prisma.user.deleteMany({ where: { role: 'PROVIDER' } });
    console.log('✅ Datos anteriores eliminados\n');

    // 2. Generar 500 proveedores
    console.log('👥 Generando 500 proveedores...');
    const providers: any[] = [];
    let providerIndex = 0;

    for (const [region, cities] of Object.entries(CITIES_BY_REGION)) {
        for (const city of cities) {
            // Crear 10-15 proveedores por ciudad grande, 5-8 por ciudad pequeña
            const providerCount = cities.length > 10 ? Math.floor(Math.random() * 6) + 10 : Math.floor(Math.random() * 4) + 5;

            for (let i = 0; i < providerCount && providerIndex < 500; i++) {
                const coords = generateCoordinates(city);

                // Crear usuario primero
                const user = await prisma.user.create({
                    data: {
                        email: `provider${providerIndex}@altocarwash.cl`,
                        firstName: BUSINESS_PREFIXES[providerIndex % BUSINESS_PREFIXES.length],
                        lastName: `Business ${providerIndex}`,
                        phone: `+569${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
                        role: 'PROVIDER',
                        status: 'ACTIVE',
                    },
                });

                const provider = await prisma.provider.create({
                    data: {
                        userId: user.id,
                        businessName: generateBusinessName(city, providerIndex),
                        businessType: 'CAR_WASH',
                        description: `Centro de lavado profesional en ${city}. Años de experiencia en el rubro.`,
                        phone: user.phone || '',
                        email: user.email,
                        address: `Avenida Principal ${Math.floor(Math.random() * 1000)}, ${city}`,
                        city: city,
                        region: region,
                        latitude: coords.lat,
                        longitude: coords.lng,
                        operatingHours: {
                            monday: { open: '09:00', close: '19:00', isOpen: true },
                            tuesday: { open: '09:00', close: '19:00', isOpen: true },
                            wednesday: { open: '09:00', close: '19:00', isOpen: true },
                            thursday: { open: '09:00', close: '19:00', isOpen: true },
                            friday: { open: '09:00', close: '19:00', isOpen: true },
                            saturday: { open: '10:00', close: '18:00', isOpen: true },
                            sunday: { open: '10:00', close: '14:00', isOpen: false },
                        },
                        rating: +(3.5 + Math.random() * 1.5).toFixed(1),
                        totalReviews: Math.floor(Math.random() * 150),
                        totalBookings: Math.floor(Math.random() * 500),
                        status: Math.random() > 0.1 ? 'ACTIVE' : 'PENDING_APPROVAL',
                        acceptsBookings: true,
                    },
                });

                providers.push(provider);
                providerIndex++;

                if (providerIndex % 50 === 0) {
                    console.log(`  ✓ ${providerIndex}/500 proveedores creados`);
                }
            }
        }
    }

    console.log(`✅ ${providers.length} proveedores creados\n`);

    // 3. Generar 14,000 servicios
    console.log('🚗 Generando 14,000 servicios...');
    const TOTAL_SERVICES = 14000;
    const BATCH_SIZE = 500; // Aumentado para más velocidad
    let serviceCount = 0;

    const totalBatches = Math.ceil(TOTAL_SERVICES / BATCH_SIZE);

    for (let batch = 0; batch < totalBatches; batch++) {
        const servicesInBatch = Math.min(BATCH_SIZE, TOTAL_SERVICES - serviceCount);
        const services: any[] = [];

        for (let i = 0; i < servicesInBatch; i++) {
            const provider = providers[Math.floor(Math.random() * providers.length)];
            const serviceType = SERVICE_TYPES[Math.floor(Math.random() * SERVICE_TYPES.length)];

            // Variación de precio ±30%
            const priceVariation = 0.7 + Math.random() * 0.6;
            const price = Math.round(serviceType.basePrice * priceVariation / 100) * 100; // Redondear a centenas

            // Posible descuento
            const hasDiscount = Math.random() > 0.7;
            const originalPrice = hasDiscount ? Math.round(price * (1.1 + Math.random() * 0.3)) : price;

            services.push({
                name: serviceType.name,
                description: `${serviceType.name} profesional en ${provider.city}. Servicio de alta calidad con productos premium. Incluye lavado, secado y revisión final.`,
                type: serviceType.type,
                category: serviceType.category,
                price: price,
                discountedPrice: hasDiscount ? price : null,
                duration: serviceType.duration + Math.floor((Math.random() - 0.5) * 20),
                providerId: provider.id,
                isAvailable: Math.random() > 0.05, // 95% activos
                status: 'ACTIVE',
                currency: 'CLP',
                tags: [serviceType.category, provider.city],
                includedServices: [],
                additionalImages: [],
                isFeatured: Math.random() > 0.9, // 10% destacados
            });
        }

        await prisma.service.createMany({
            data: services,
            skipDuplicates: true,
        });

        serviceCount += services.length;
        console.log(`  ✓ ${serviceCount}/${TOTAL_SERVICES} servicios creados (${Math.round(serviceCount / TOTAL_SERVICES * 100)}%)`);
    }

    console.log(`✅ ${serviceCount} servicios creados\n`);

    // 4. Estadísticas finales
    console.log('📊 Generando estadísticas...\n');

    const [totalProviders, totalServices, servicesByCategory, avgPrice] = await Promise.all([
        prisma.provider.count(),
        prisma.service.count(),
        prisma.service.groupBy({
            by: ['category'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        }),
        prisma.service.aggregate({
            _avg: { price: true },
            _min: { price: true },
            _max: { price: true },
        }),
    ]);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('═══════════════════════════════════════════');
    console.log('           RESUMEN FINAL                   ');
    console.log('═══════════════════════════════════════════');
    console.log(`✅ Total Proveedores: ${totalProviders}`);
    console.log(`✅ Total Servicios: ${totalServices}`);
    console.log(`⏱️  Tiempo de ejecución: ${duration} segundos`);
    console.log('\n📈 Servicios por Categoría:');

    servicesByCategory.forEach((cat: any) => {
        const percentage = ((cat._count.id / totalServices) * 100).toFixed(1);
        console.log(`   ${cat.category.padEnd(20)} ${cat._count.id.toString().padStart(6)} (${percentage}%)`);
    });

    console.log('\n💰 Precios:');
    console.log(`   Promedio: $${Math.round(Number(avgPrice._avg.price) || 0).toLocaleString('es-CL')}`);
    console.log(`   Mínimo:   $${Number(avgPrice._min.price || 0).toLocaleString('es-CL')}`);
    console.log(`   Máximo:   $${Number(avgPrice._max.price || 0).toLocaleString('es-CL')}`);

    console.log('\n═══════════════════════════════════════════');
    console.log('🎉 ¡Seeding completado exitosamente!');
    console.log('═══════════════════════════════════════════\n');
}

main()
    .catch((e) => {
        console.error('\n❌ Error durante el seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
