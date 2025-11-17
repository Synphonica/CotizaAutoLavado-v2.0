import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const providers = await prisma.provider.findMany({ include: { services: true } });
console.log('\ní³Š Estado completo:\n');
providers.forEach(p => {
    console.log(`${p.businessName} (${p.email})`);
    console.log(`  Servicios: ${p.services.length}`);
    p.services.forEach(s => console.log(`    - ${s.name} ($${s.price})`));
    console.log('');
});

await prisma.$disconnect();
