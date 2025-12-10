import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDuplicates() {
    console.log('🔍 Buscando proveedores duplicados...');

    // Encontrar duplicados
    const duplicates = await prisma.provider.groupBy({
        by: ['businessName'],
        _count: {
            businessName: true
        },
        having: {
            businessName: {
                _count: {
                    gt: 1
                }
            }
        }
    });

    console.log(`📊 Encontrados ${duplicates.length} nombres duplicados`);

    let providersDeleted = 0;
    let servicesDeleted = 0;

    // Para cada nombre duplicado, mantener solo el más reciente
    for (const dup of duplicates) {
        const providers = await prisma.provider.findMany({
            where: {
                businessName: dup.businessName
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                services: true
            }
        });

        // Mantener el primero (más reciente), eliminar los demás
        const toDelete = providers.slice(1);

        for (const provider of toDelete) {
            // Primero eliminar servicios asociados
            const deletedServices = await prisma.service.deleteMany({
                where: {
                    providerId: provider.id
                }
            });
            servicesDeleted += deletedServices.count;

            // Luego eliminar el proveedor
            await prisma.provider.delete({
                where: {
                    id: provider.id
                }
            });
            providersDeleted++;
        }

        if (providersDeleted % 100 === 0) {
            console.log(`🗑️  Eliminados ${providersDeleted} proveedores duplicados...`);
        }
    }

    console.log('\n✅ Limpieza completada:');
    console.log(`   - Proveedores eliminados: ${providersDeleted}`);
    console.log(`   - Servicios eliminados: ${servicesDeleted}`);

    // Verificar resultado final
    const totalProviders = await prisma.provider.count();
    const totalServices = await prisma.service.count();
    const remainingDuplicates = await prisma.provider.groupBy({
        by: ['businessName'],
        _count: {
            businessName: true
        },
        having: {
            businessName: {
                _count: {
                    gt: 1
                }
            }
        }
    });

    console.log('\n📊 Estado final:');
    console.log(`   - Total proveedores: ${totalProviders}`);
    console.log(`   - Total servicios: ${totalServices}`);
    console.log(`   - Duplicados restantes: ${remainingDuplicates.length}`);

    await prisma.$disconnect();
}

removeDuplicates()
    .catch((error) => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
