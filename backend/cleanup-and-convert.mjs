import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

console.log('\ní·‘ï¸  Limpiando base de datos...\n');

// 1. Eliminar servicios
const deletedServices = await prisma.service.deleteMany({});
console.log(`âœ“ ${deletedServices.count} servicios eliminados`);

// 2. Eliminar proveedores
const deletedProviders = await prisma.provider.deleteMany({});
console.log(`âœ“ ${deletedProviders.count} proveedores eliminados`);

// 3. Eliminar usuarios sin clerkId (scrapeados)
const deletedUsers = await prisma.user.deleteMany({
    where: { clerkId: null }
});
console.log(`âœ“ ${deletedUsers.count} usuarios scrapeados eliminados`);

// 4. Convertir usuarios con clerkId a CUSTOMER
const updatedUsers = await prisma.user.updateMany({
    where: { 
        clerkId: { not: null },
        role: 'PROVIDER'
    },
    data: { role: 'CUSTOMER' }
});
console.log(`âœ“ ${updatedUsers.count} usuarios convertidos a CUSTOMER`);

// 5. Mostrar estado final
const finalUsers = await prisma.user.findMany({
    select: {
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        clerkId: true
    }
});

console.log('\ní³Š Usuarios finales:\n');
finalUsers.forEach(u => {
    console.log(`  - ${u.firstName} ${u.lastName} (${u.email})`);
    console.log(`    Rol: ${u.role}, ClerkId: ${u.clerkId ? 'âœ“' : 'âœ—'}\n`);
});

console.log('âœ… Limpieza completada\n');

await prisma.$disconnect();
