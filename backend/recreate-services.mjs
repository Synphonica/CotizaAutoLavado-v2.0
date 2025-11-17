import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

await prisma.service.deleteMany({});
console.log('✓ Servicios anteriores eliminados\n');

const SERVICES = [
    { name: 'Lavado Básico', type: 'BASIC_WASH', price: 5000, duration: 30, desc: 'Lavado exterior con agua a presión, enjuague y secado básico. Incluye limpieza de ventanas exteriores.' },
    { name: 'Lavado Completo', type: 'BASIC_WASH', price: 12000, duration: 60, desc: 'Lavado completo exterior e interior. Incluye aspirado de alfombras y asientos, limpieza de paneles y ventanas.' },
    { name: 'Lavado Premium', type: 'PREMIUM_WASH', price: 18000, duration: 90, desc: 'Servicio premium que incluye lavado completo, encerado básico y pulido de faros.' },
    { name: 'Detailing Completo', type: 'DETAILING', price: 45000, duration: 180, desc: 'Servicio profesional de detailing con pulido, encerado de alta calidad y restauración de pintura.' },
    { name: 'Encerado Profesional', type: 'WAXING', price: 22000, duration: 75, desc: 'Aplicación de cera de carnauba premium para protección y brillo duradero de la pintura.' },
    { name: 'Limpieza Interior Profunda', type: 'INTERIOR_CLEAN', price: 15000, duration: 60, desc: 'Limpieza profunda de tapizados, alfombras y paneles con productos especializados.' },
    { name: 'Limpieza de Motor', type: 'ENGINE_CLEAN', price: 12000, duration: 45, desc: 'Lavado y desengrase del compartimento del motor con productos especializados.' },
    { name: 'Lavado y Brillo de Neumáticos', type: 'TIRE_CLEAN', price: 8000, duration: 30, desc: 'Limpieza profunda de neumáticos y aros con aplicación de abrillantador.' },
];

const providers = await prisma.provider.findMany();
let total = 0;

for (const provider of providers) {
    console.log(`Creando servicios para: ${provider.businessName}`);
    
    for (const s of SERVICES) {
        await prisma.service.create({
            data: {
                providerId: provider.id,
                name: s.name,
                type: s.type,
                price: s.price,
                duration: s.duration,
                description: s.desc,
                isAvailable: true,
            },
        });
        total++;
    }
    console.log(`  ✓ ${SERVICES.length} servicios creados\n`);
}

console.log(`✅ Total: ${total} servicios para ${providers.length} proveedores\n`);
await prisma.$disconnect();
