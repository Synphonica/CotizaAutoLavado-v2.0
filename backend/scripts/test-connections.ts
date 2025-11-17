import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnections() {
    console.log('🔍 Verificando Conexiones\n');
    console.log('='.repeat(50));

    // Test 1: Conexión a Base de Datos
    console.log('\n📊 Test 1: Conexión a PostgreSQL/Supabase');
    console.log('-'.repeat(50));
    try {
        await prisma.$connect();
        console.log('✓ Conexión a base de datos: EXITOSA');

        // Verificar si hay usuarios
        const userCount = await prisma.user.count();
        console.log(`✓ Usuarios en la base de datos: ${userCount}`);

        // Verificar tipo de base de datos
        const dbUrl = process.env.DATABASE_URL || '';
        if (dbUrl.includes('supabase')) {
            console.log('✓ Proveedor: Supabase PostgreSQL');
        } else if (dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1')) {
            console.log('✓ Proveedor: PostgreSQL Local');
        } else {
            console.log('✓ Proveedor: PostgreSQL Remoto');
        }
    } catch (error) {
        console.log('✗ Error conectando a base de datos:');
        console.log('  ' + error.message);
    }

    // Test 2: Verificar Clerk Secret Key
    console.log('\n🔐 Test 2: Configuración de Clerk');
    console.log('-'.repeat(50));
    const clerkKey = process.env.CLERK_SECRET_KEY;
    if (clerkKey && clerkKey.startsWith('sk_')) {
        console.log('✓ CLERK_SECRET_KEY configurado correctamente');
    } else {
        console.log('✗ CLERK_SECRET_KEY no configurado o inválido');
        console.log('  Formato esperado: sk_test_... o sk_live_...');
    }

    // Test 3: Verificar estructura de la tabla User
    console.log('\n👤 Test 3: Estructura de la tabla User');
    console.log('-'.repeat(50));
    try {
        const sampleUser = await prisma.user.findFirst({
            select: {
                id: true,
                clerkId: true,
                email: true,
                firstName: true,
                role: true,
                status: true,
            }
        });

        if (sampleUser) {
            console.log('✓ Tabla User tiene la estructura correcta');
            console.log('✓ Campo clerkId presente:', sampleUser.clerkId ? 'Sí' : 'No (null)');

            if (sampleUser.clerkId) {
                console.log('✓ Ejemplo de clerkId:', sampleUser.clerkId);
            } else {
                console.log('⚠ Ningún usuario tiene clerkId asignado todavía');
                console.log('  Esto es normal si aún no has hecho login con Clerk');
            }
        } else {
            console.log('⚠ No hay usuarios en la base de datos');
            console.log('  Esto es normal en una instalación nueva');
        }
    } catch (error) {
        console.log('✗ Error verificando estructura:');
        console.log('  ' + error.message);
    }

    // Test 4: Verificar usuarios con clerkId
    console.log('\n🔗 Test 4: Usuarios sincronizados con Clerk');
    console.log('-'.repeat(50));
    try {
        const usersWithClerk = await prisma.user.count({
            where: {
                clerkId: {
                    not: null
                }
            }
        });

        const totalUsers = await prisma.user.count();

        console.log(`✓ Total de usuarios: ${totalUsers}`);
        console.log(`✓ Usuarios sincronizados con Clerk: ${usersWithClerk}`);

        if (usersWithClerk === 0 && totalUsers > 0) {
            console.log('⚠ Hay usuarios sin clerkId');
            console.log('  Estos usuarios fueron creados antes de integrar Clerk');
            console.log('  Se vincularán automáticamente cuando inicien sesión con Clerk');
        }

        if (usersWithClerk > 0) {
            console.log('✓ ¡La integración Clerk-DB está funcionando!');
        }
    } catch (error) {
        console.log('✗ Error contando usuarios:');
        console.log('  ' + error.message);
    }

    // Test 5: Verificar últimos logins
    console.log('\n⏰ Test 5: Actividad reciente');
    console.log('-'.repeat(50));
    try {
        const recentUsers = await prisma.user.findMany({
            where: {
                lastLoginAt: {
                    not: null
                }
            },
            orderBy: {
                lastLoginAt: 'desc'
            },
            take: 3,
            select: {
                email: true,
                firstName: true,
                lastLoginAt: true,
                clerkId: true,
            }
        });

        if (recentUsers.length > 0) {
            console.log(`✓ Últimos ${recentUsers.length} logins:`);
            recentUsers.forEach((user, i) => {
                const time = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'N/A';
                console.log(`  ${i + 1}. ${user.email} - ${time}`);
                console.log(`     ClerkId: ${user.clerkId ? '✓ Sincronizado' : '✗ No sincronizado'}`);
            });
        } else {
            console.log('⚠ No hay registros de login todavía');
            console.log('  Haz login en la aplicación para probar la sincronización');
        }
    } catch (error) {
        console.log('✗ Error consultando actividad:');
        console.log('  ' + error.message);
    }

    // Resumen final
    console.log('\n' + '='.repeat(50));
    console.log('📋 RESUMEN');
    console.log('='.repeat(50));

    const hasClerkKey = process.env.CLERK_SECRET_KEY && process.env.CLERK_SECRET_KEY.startsWith('sk_');
    const usersWithClerk = await prisma.user.count({
        where: { clerkId: { not: null } }
    });

    if (hasClerkKey && usersWithClerk > 0) {
        console.log('✅ TODO CORRECTO: Clerk y Base de Datos están conectados');
        console.log('   Los usuarios se están sincronizando correctamente');
    } else if (hasClerkKey && usersWithClerk === 0) {
        console.log('⚠️  CONFIGURADO PERO SIN USUARIOS SINCRONIZADOS');
        console.log('   Clerk está configurado pero nadie ha iniciado sesión todavía');
        console.log('   Acción: Haz login en http://localhost:3000/sign-in');
    } else if (!hasClerkKey) {
        console.log('❌ CLERK NO CONFIGURADO');
        console.log('   Acción: Configura CLERK_SECRET_KEY en backend/.env');
    }

    console.log('\n🔗 Próximos pasos:');
    console.log('   1. Inicia el backend: cd backend && npm run start:dev');
    console.log('   2. Inicia el frontend: cd frontend && npm run dev');
    console.log('   3. Haz login en: http://localhost:3000/sign-in');
    console.log('   4. Vuelve a ejecutar este script para verificar');
    console.log('');

    await prisma.$disconnect();
}

testConnections()
    .catch((e) => {
        console.error('Error ejecutando tests:', e);
        process.exit(1);
    });
