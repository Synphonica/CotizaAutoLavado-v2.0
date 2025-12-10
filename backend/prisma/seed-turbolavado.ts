import { PrismaClient, UserRole, UserStatus, ProviderStatus, ServiceType, ServiceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Configurando Turbolavado R y N...\n');

    try {
        // 1. Crear o actualizar usuario
        const user = await prisma.user.upsert({
            where: { email: 'turbolavado@ryn.cl' },
            update: {},
            create: {
                email: 'turbolavado@ryn.cl',
                firstName: 'Turbolavado',
                lastName: 'R y N',
                phone: '+56912345678',
                role: UserRole.PROVIDER,
                status: UserStatus.ACTIVE,
            },
        });

        console.log('✅ Usuario creado/actualizado:', user.email);

        // 2. Crear o actualizar proveedor
        const provider = await prisma.provider.upsert({
            where: { userId: user.id },
            update: {
                status: ProviderStatus.ACTIVE,
                acceptsBookings: true,
            },
            create: {
                userId: user.id,
                businessName: 'Turbolavado R y N',
                businessType: 'Autolavado Profesional',
                description: 'Autolavado profesional con servicios de calidad. Especialistas en lavado exterior, interior y detailing.',
                status: ProviderStatus.ACTIVE,
                phone: '+56912345678',
                email: 'turbolavado@ryn.cl',
                website: '',
                instagram: '',
                address: 'Santiago Centro, Región Metropolitana',
                latitude: -33.4372,
                longitude: -70.6506,
                city: 'Santiago',
                region: 'Metropolitana',
                postalCode: '8320000',
                rating: 4.5,
                totalReviews: 0,
                acceptsBookings: true,
                minAdvanceBooking: 60, // 1 hora en minutos
                maxAdvanceBooking: 10080, // 7 días en minutos
                operatingHours: {
                    monday: { open: '09:00', close: '19:00' },
                    tuesday: { open: '09:00', close: '19:00' },
                    wednesday: { open: '09:00', close: '19:00' },
                    thursday: { open: '09:00', close: '19:00' },
                    friday: { open: '09:00', close: '20:00' },
                    saturday: { open: '09:00', close: '18:00' },
                    sunday: { open: '10:00', close: '16:00' },
                },
                verifiedAt: new Date(),
            },
        });

        console.log('✅ Proveedor creado/actualizado:', provider.businessName);

        // 3. Crear servicios
        const services = [
            {
                name: 'Lavado Exterior Completo',
                description: 'Lavado completo del exterior del vehículo incluyendo carrocería, llantas y vidrios',
                type: ServiceType.BASIC_WASH,
                price: 8000,
                duration: 30,
            },
            {
                name: 'Lavado Interior',
                description: 'Limpieza profunda del interior: aspirado, limpieza de tapiz y panel',
                type: ServiceType.INTERIOR_CLEAN,
                price: 12000,
                duration: 45,
            },
            {
                name: 'Lavado Completo (Exterior + Interior)',
                description: 'Servicio completo: lavado exterior e interior del vehículo',
                type: ServiceType.PREMIUM_WASH,
                price: 18000,
                duration: 60,
            },
            {
                name: 'Lavado de Motor',
                description: 'Limpieza y desengrase del compartimiento del motor',
                type: ServiceType.ENGINE_CLEAN,
                price: 10000,
                duration: 30,
            },
            {
                name: 'Pulido y Encerado',
                description: 'Pulido profesional y aplicación de cera protectora de alta calidad',
                type: ServiceType.WAXING,
                price: 25000,
                duration: 90,
            },
        ];

        console.log('\n📦 Creando servicios...\n');

        for (const [index, serviceData] of services.entries()) {
            // Buscar si el servicio ya existe
            const existingService = await prisma.service.findFirst({
                where: {
                    providerId: provider.id,
                    name: serviceData.name,
                },
            });

            let service;
            if (existingService) {
                // Actualizar servicio existente
                service = await prisma.service.update({
                    where: { id: existingService.id },
                    data: {
                        description: serviceData.description,
                        price: serviceData.price,
                        duration: serviceData.duration,
                        status: ServiceStatus.ACTIVE,
                        isAvailable: true,
                    },
                });
            } else {
                // Crear nuevo servicio
                service = await prisma.service.create({
                    data: {
                        providerId: provider.id,
                        name: serviceData.name,
                        description: serviceData.description,
                        type: serviceData.type,
                        status: ServiceStatus.ACTIVE,
                        price: serviceData.price,
                        duration: serviceData.duration,
                        currency: 'CLP',
                        isAvailable: true,
                        isFeatured: index === 0,
                        displayOrder: index,
                    },
                });
            }

            console.log(`  ✅ ${service.name} - $${service.price}`);
        }

        console.log('\n✨ ¡Configuración completada!\n');
        console.log('📊 Resumen:');
        console.log(`   Usuario: ${user.email}`);
        console.log(`   Proveedor: ${provider.businessName}`);
        console.log(`   Servicios: ${services.length}`);
        console.log(`   Estado: ${provider.status}`);
        console.log(`   Acepta Reservas: ${provider.acceptsBookings ? 'Sí' : 'No'}`);
        console.log('\n🎉 El proveedor está listo para recibir reservas y notificaciones!');

    } catch (error) {
        console.error('\n❌ Error durante la configuración:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error('❌ Error fatal:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
