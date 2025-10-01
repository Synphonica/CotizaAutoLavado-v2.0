import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de datos...');

  // Crear usuarios de prueba
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@altocarwash.cl' },
      update: {},
      create: {
        email: 'admin@altocarwash.cl',
        firstName: 'Admin',
        lastName: 'Alto Carwash',
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    }),
    prisma.user.upsert({
      where: { email: 'provider1@altocarwash.cl' },
      update: {},
      create: {
        email: 'provider1@altocarwash.cl',
        firstName: 'Carlos',
        lastName: 'Mendoza',
        role: 'PROVIDER',
        status: 'ACTIVE',
      },
    }),
    prisma.user.upsert({
      where: { email: 'provider2@altocarwash.cl' },
      update: {},
      create: {
        email: 'provider2@altocarwash.cl',
        firstName: 'Ana',
        lastName: 'Rodriguez',
        role: 'PROVIDER',
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log('✅ Usuarios creados:', users.length);

  // Crear proveedores
  const providers = await Promise.all([
    prisma.provider.upsert({
      where: { userId: users[1].id },
      update: {},
      create: {
        userId: users[1].id,
        businessName: 'AutoClean Pro',
        businessType: 'Autolavado',
        description: 'Servicio premium de lavado de autos con productos de alta calidad',
        status: 'ACTIVE',
        phone: '+56912345678',
        email: 'info@autocleanpro.cl',
        website: 'https://autocleanpro.cl',
        address: 'Av. Providencia 1234, Providencia',
        latitude: -33.4172,
        longitude: -70.6064,
        city: 'Santiago',
        region: 'Metropolitana',
        postalCode: '7500000',
        operatingHours: {
          monday: { open: '08:00', close: '20:00' },
          tuesday: { open: '08:00', close: '20:00' },
          wednesday: { open: '08:00', close: '20:00' },
          thursday: { open: '08:00', close: '20:00' },
          friday: { open: '08:00', close: '20:00' },
          saturday: { open: '09:00', close: '18:00' },
          sunday: { open: '10:00', close: '16:00' },
        },
        rating: 4.8,
        totalReviews: 150,
        totalBookings: 500,
        verifiedAt: new Date(),
      },
    }),
    prisma.provider.upsert({
      where: { userId: users[2].id },
      update: {},
      create: {
        userId: users[2].id,
        businessName: 'Car Spa Premium',
        businessType: 'Detailing',
        description: 'Servicios de detailing y cuidado premium para tu vehículo',
        status: 'ACTIVE',
        phone: '+56987654321',
        email: 'info@carspapremium.cl',
        website: 'https://carspapremium.cl',
        address: 'Av. Las Condes 5678, Las Condes',
        latitude: -33.4172,
        longitude: -70.6064,
        city: 'Santiago',
        region: 'Metropolitana',
        postalCode: '7500000',
        operatingHours: {
          monday: { open: '09:00', close: '19:00' },
          tuesday: { open: '09:00', close: '19:00' },
          wednesday: { open: '09:00', close: '19:00' },
          thursday: { open: '09:00', close: '19:00' },
          friday: { open: '09:00', close: '19:00' },
          saturday: { open: '10:00', close: '17:00' },
          sunday: { open: '11:00', close: '15:00' },
        },
        rating: 4.9,
        totalReviews: 200,
        totalBookings: 800,
        verifiedAt: new Date(),
      },
    }),
  ]);

  console.log('✅ Proveedores creados:', providers.length);

  // Crear servicios
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-1' },
      update: {},
      create: {
        id: 'service-1',
        providerId: providers[0].id,
        name: 'Lavado Exterior Premium',
        description: 'Lavado completo del exterior con productos premium y encerado',
        type: 'PREMIUM_WASH',
        status: 'ACTIVE',
        currency: 'CLP',
        category: 'Lavado Exterior',
        tags: ['premium', 'encerado', 'exterior'],
        isAvailable: true,
        price: 15000,
        discountedPrice: 12000,
        duration: 60,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-2' },
      update: {},
      create: {
        id: 'service-2',
        providerId: providers[0].id,
        name: 'Lavado Completo + Encerado',
        description: 'Lavado completo interior y exterior con encerado premium',
        type: 'PREMIUM_WASH',
        status: 'ACTIVE',
        currency: 'CLP',
        category: 'Lavado Completo',
        tags: ['completo', 'interior', 'exterior', 'encerado'],
        isAvailable: true,
        price: 25000,
        discountedPrice: 20000,
        duration: 90,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-3' },
      update: {},
      create: {
        id: 'service-3',
        providerId: providers[1].id,
        name: 'Detailing Premium',
        description: 'Servicio de detailing completo con productos de alta gama',
        type: 'DETAILING',
        status: 'ACTIVE',
        currency: 'CLP',
        category: 'Detailing',
        tags: ['detailing', 'premium', 'alta-gama'],
        isAvailable: true,
        price: 35000,
        duration: 120,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-4' },
      update: {},
      create: {
        id: 'service-4',
        providerId: providers[1].id,
        name: 'Lavado Express',
        description: 'Lavado rápido y eficiente para el día a día',
        type: 'BASIC_WASH',
        status: 'ACTIVE',
        currency: 'CLP',
        category: 'Lavado Básico',
        tags: ['express', 'rápido', 'básico'],
        isAvailable: true,
        price: 8000,
        duration: 30,
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-5' },
      update: {},
      create: {
        id: 'service-5',
        providerId: providers[0].id,
        name: 'Lavado + Aspirado Interior',
        description: 'Lavado exterior y aspirado completo del interior',
        type: 'PREMIUM_WASH',
        status: 'ACTIVE',
        currency: 'CLP',
        category: 'Lavado Completo',
        tags: ['interior', 'exterior', 'aspirado'],
        isAvailable: true,
        price: 18000,
        discountedPrice: 16200,
        duration: 75,
      },
    }),
  ]);

  console.log('✅ Servicios creados:', services.length);

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
