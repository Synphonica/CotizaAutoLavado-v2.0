import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SERVICE_TEMPLATES = [
    { name: 'Lavado Básico', category: 'BASIC_WASH', basePrice: 5000, duration: 30, description: 'Lavado exterior, enjuague con agua a presión, secado básico y limpieza de ventanas exteriores' },
    { name: 'Lavado Completo', category: 'FULL_WASH', basePrice: 8000, duration: 60, description: 'Lavado exterior e interior completo, aspirado, limpieza de ventanas y paneles, secado profesional' },
    { name: 'Lavado Express', category: 'BASIC_WASH', basePrice: 4000, duration: 20, description: 'Lavado exterior rápido, enjuague express y secado básico' },
    { name: 'Lavado Premium', category: 'PREMIUM_WASH', basePrice: 15000, duration: 90, description: 'Lavado completo + encerado, pulido de faros, limpieza de motor y tratamiento de interiores' },
    { name: 'Detailing Completo', category: 'DETAILING', basePrice: 35000, duration: 180, description: 'Servicio profesional de detailing: pulido, encerado, tratamiento cerámico y restauración' },
    { name: 'Limpieza de Tapiz', category: 'INTERIOR_CLEANING', basePrice: 12000, duration: 45, description: 'Limpieza profunda de tapizados con productos especializados y eliminación de manchas' },
    { name: 'Encerado Premium', category: 'WAX', basePrice: 18000, duration: 60, description: 'Aplicación de cera de carnauba de alta calidad para protección y brillo duradero' },
    { name: 'Pulido de Faros', category: 'POLISH', basePrice: 8000, duration: 30, description: 'Restauración de faros opacos, mejora visibilidad nocturna y aspecto del vehículo' },
];

console.log('\n��� Creando servicios para usuarios existentes\n');

// 1. Obtener usuarios
const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
console.log(`✓ Encontrados ${users.length} usuarios\n`);

// 2. Crear proveedores
const providers = [];
for (const user of users) {
    await prisma.user.update({ where: { id: user.id }, data: { role: 'PROVIDER' } });
    
    const provider = await prisma.provider.create({
        data: {
            userId: user.id,
            businessName: `${user.firstName}'s Car Wash`,
            businessType: 'CAR_WASH',
            description: 'Centro de lavado profesional en la Región Metropolitana',
            phone: '+56912345678',
            email: user.email,
            address: 'Av. Principal 123, Santiago',
            city: 'Santiago',
            region: 'Región Metropolitana',
            latitude: -33.4489,
            longitude: -70.6693,
            operatingHours: {
                monday: { open: '09:00', close: '19:00', isOpen: true },
                tuesday: { open: '09:00', close: '19:00', isOpen: true },
                wednesday: { open: '09:00', close: '19:00', isOpen: true },
                thursday: { open: '09:00', close: '19:00', isOpen: true },
                friday: { open: '09:00', close: '19:00', isOpen: true },
                saturday: { open: '10:00', close: '18:00', isOpen: true },
                sunday: { open: '10:00', close: '14:00', isOpen: false },
            },
            rating: 4.5,
            totalReviews: 0,
            totalBookings: 0,
            status: 'ACTIVE',
            acceptsBookings: true,
        },
    });
    providers.push(provider);
    console.log(`✓ Proveedor creado: ${provider.businessName}`);
}

// 3. Crear servicios
let total = 0;
for (const provider of providers) {
    console.log(`\n��� Servicios para: ${provider.businessName}`);
    for (const t of SERVICE_TEMPLATES) {
        await prisma.service.create({
            data: {
                providerId: provider.id,
                name: t.name,
                category: t.category,
                price: t.basePrice,
                originalPrice: Math.round(t.basePrice * 1.2),
                discount: 20,
                duration: t.duration,
                description: t.description,
                isActive: true,
                isAvailable: true,
            },
        });
        total++;
        console.log(`   ✓ ${t.name} - $${t.basePrice.toLocaleString()}`);
    }
}

console.log(`\n✅ Completado: ${providers.length} proveedores, ${total} servicios\n`);
await prisma.$disconnect();
