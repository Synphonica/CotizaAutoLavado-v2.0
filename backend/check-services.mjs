import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const services = await prisma.service.count();
const providers = await prisma.provider.count();
const users = await prisma.user.count();

console.log('\ní³Š Estado actual de la base de datos:\n');
console.log(`   Usuarios: ${users}`);
console.log(`   Proveedores: ${providers}`);
console.log(`   Servicios: ${services}\n`);

await prisma.$disconnect();
