import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const users = await prisma.user.findMany({
    select: { email: true, firstName: true, lastName: true, role: true, clerkId: true }
});

console.log('\ní³Š Usuarios en la base de datos:\n');
users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.firstName} ${u.lastName} (${u.email})`);
    console.log(`   Rol: ${u.role}`);
    console.log(`   ClerkId: ${u.clerkId ? 'âœ“' : 'âœ—'}\n`);
});

await prisma.$disconnect();
