import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const SERVICES = [
    { name: 'Lavado Básico', category: 'BASIC_WASH', type: 'BASIC_WASH', price: 5000, duration: 30, desc: 'Lavado exterior, enjuague con agua a presión, secado básico' },
    { name: 'Lavado Completo', category: 'FULL_WASH', type: 'FULL_WASH', price: 8000, duration: 60, desc: 'Lavado completo exterior e interior, aspirado y limpieza de ventanas' },
    { name: 'Lavado Express', category: 'BASIC_WASH', type: 'EXPRESS_WASH', price: 4000, duration: 20, desc: 'Lavado rápido exterior con secado básico' },
    { name: 'Lavado Premium', category: 'PREMIUM_WASH', type: 'PREMIUM_WASH', price: 15000, duration: 90, desc: 'Lavado completo + encerado, pulido de faros y tratamiento de interiores' },
    { name: 'Detailing Completo', category: 'DETAILING', type: 'DETAILING', price: 35000, duration: 180, desc: 'Servicio profesional: pulido, encerado y tratamiento cerámico' },
    { name: 'Limpieza de Tapiz', category: 'INTERIOR_CLEANING', type: 'INTERIOR_CLEANING', price: 12000, duration: 45, desc: 'Limpieza profunda de tapizados con productos especializados' },
    { name: 'Encerado Premium', category: 'WAX', type: 'WAX', price: 18000, duration: 60, desc: 'Cera de carnauba de alta calidad para protección duradera' },
    { name: 'Pulido de Faros', category: 'POLISH', type: 'POLISH', price: 8000, duration: 30, desc: 'Restauración de faros opacos para mejor visibilidad' },
];

const providers = await prisma.provider.findMany();
console.log(`\n��� Creando servicios para ${providers.length} proveedores\n`);

let total = 0;
for (const provider of providers) {
    console.log(`${provider.businessName}:`);
    for (const s of SERVICES) {
        await prisma.service.create({
            data: {
                providerId: provider.id,
                name: s.name,
                type: s.type,
                category: s.category,
                price: s.price,
                duration: s.duration,
                description: s.desc,
                isAvailable: true,
            },
        });
        total++;
        console.log(`  ✓ ${s.name}`);
    }
}

console.log(`\n✅ ${total} servicios creados!\n`);
await prisma.$disconnect();
