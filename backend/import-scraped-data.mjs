import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();

const rawData = readFileSync('../scraper/output/carwashes_rm_complete.json', 'utf-8');
const carwashes = JSON.parse(rawData);

console.log(`\n��� Importando ${carwashes.length} carwashes scrapeados\n`);

// Filtrar solo los que tengan datos mínimos
const validCarwashes = carwashes.filter(c => 
    c.address && c.latitude && c.longitude && c.comuna
);

console.log(`✓ Carwashes con datos completos: ${validCarwashes.length}\n`);

let created = 0;
let skipped = 0;

for (let i = 0; i < validCarwashes.length; i++) {
    const carwash = validCarwashes[i];
    
    try {
        // Generar nombre desde la dirección
        const businessName = `Autolavado ${carwash.address.split(',')[0]} - ${carwash.comuna}`;
        
        // Email único
        const emailBase = carwash.address
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 20);
        
        const email = `${emailBase}${i}@scraped.local`;

        // Verificar duplicado
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            skipped++;
            continue;
        }

        // Crear usuario
        const user = await prisma.user.create({
            data: {
                email,
                firstName: 'Autolavado',
                lastName: carwash.comuna,
                role: 'PROVIDER',
                status: 'ACTIVE',
            },
        });

        // Crear proveedor
        const provider = await prisma.provider.create({
            data: {
                userId: user.id,
                businessName,
                businessType: 'CAR_WASH',
                description: `Autolavado ubicado en ${carwash.address}`,
                phone: carwash.phone || '+56900000000',
                email: user.email,
                address: carwash.address,
                city: carwash.comuna,
                region: carwash.region || 'Región Metropolitana',
                latitude: parseFloat(carwash.latitude),
                longitude: parseFloat(carwash.longitude),
                operatingHours: {
                    monday: { open: '09:00', close: '19:00', isOpen: true },
                    tuesday: { open: '09:00', close: '19:00', isOpen: true },
                    wednesday: { open: '09:00', close: '19:00', isOpen: true },
                    thursday: { open: '09:00', close: '19:00', isOpen: true },
                    friday: { open: '09:00', close: '19:00', isOpen: true },
                    saturday: { open: '10:00', close: '18:00', isOpen: true },
                    sunday: { open: '10:00', close: '14:00', isOpen: false },
                },
                rating: parseFloat(carwash.rating) || 4.0,
                totalReviews: parseInt(carwash.reviewCount) || 0,
                totalBookings: 0,
                status: 'ACTIVE',
                acceptsBookings: true,
            },
        });

        // 3 servicios básicos
        const services = [
            { name: 'Lavado Básico', type: 'BASIC_WASH', price: 5000, duration: 30 },
            { name: 'Lavado Completo', type: 'BASIC_WASH', price: 12000, duration: 60 },
            { name: 'Lavado Premium', type: 'PREMIUM_WASH', price: 18000, duration: 90 },
        ];

        for (const s of services) {
            await prisma.service.create({
                data: {
                    providerId: provider.id,
                    name: s.name,
                    type: s.type,
                    price: s.price,
                    duration: s.duration,
                    description: `${s.name} - ${carwash.comuna}`,
                    isAvailable: true,
                },
            });
        }

        created++;
        if (created % 20 === 0) {
            console.log(`  ✓ ${created} proveedores importados...`);
        }
    } catch (error) {
        skipped++;
        if (skipped <= 5) {
            console.error(`  ✗ Error: ${error.message}`);
        }
    }
}

console.log(`\n✅ Completado:`);
console.log(`   - Proveedores creados: ${created}`);
console.log(`   - Servicios creados: ${created * 3}`);
console.log(`   - Errores/omitidos: ${skipped}\n`);

await prisma.$disconnect();
