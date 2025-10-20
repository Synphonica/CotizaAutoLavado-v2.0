import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { CarWashData } from '../types';
import {
    mapToUserData,
    mapToProviderData,
    mapToServices,
    validateCarWashData,
} from './dataMapper';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

interface ImportResult {
    success: number;
    failed: number;
    skipped: number;
    errors: Array<{ carwash: string; error: string }>;
}

/**
 * Importa datos de autolavados a la base de datos usando Prisma
 */
export class PrismaImporter {
    /**
     * Importa datos desde un archivo JSON
     */
    static async importFromJSON(filename: string = 'carwashes.json'): Promise<ImportResult> {
        console.log('🚀 =============================================');
        console.log('📦 IMPORTADOR DE DATOS A BASE DE DATOS');
        console.log('===============================================\n');

        const result: ImportResult = {
            success: 0,
            failed: 0,
            skipped: 0,
            errors: [],
        };

        try {
            // Leer archivo JSON
            const filePath = path.join(process.cwd(), 'output', filename);

            if (!fs.existsSync(filePath)) {
                throw new Error(`Archivo no encontrado: ${filePath}`);
            }

            console.log(`📂 Leyendo archivo: ${filename}\n`);
            const jsonData = fs.readFileSync(filePath, 'utf-8');
            const carwashes: CarWashData[] = JSON.parse(jsonData);

            console.log(`📊 Total de registros a importar: ${carwashes.length}\n`);
            console.log('⏳ Iniciando importación...\n');

            // Importar cada autolavado
            for (let i = 0; i < carwashes.length; i++) {
                const carwash = carwashes[i];
                console.log(`[${i + 1}/${carwashes.length}] Procesando: ${carwash.name}`);

                try {
                    await this.importCarWash(carwash);
                    result.success++;
                    console.log(`   ✅ Importado exitosamente\n`);
                } catch (error: any) {
                    // Verificar si el error es por duplicado
                    if (
                        error.code === 'P2002' ||
                        error.message?.includes('Unique constraint')
                    ) {
                        result.skipped++;
                        console.log(`   ⚠️  Ya existe en la base de datos (omitido)\n`);
                    } else {
                        result.failed++;
                        result.errors.push({
                            carwash: carwash.name,
                            error: error.message,
                        });
                        console.log(`   ❌ Error: ${error.message}\n`);
                    }
                }
            }

            return result;
        } catch (error: any) {
            console.error(`\n❌ Error fatal: ${error.message}`);
            throw error;
        }
    }

    /**
     * Importa un solo autolavado
     */
    static async importCarWash(carwash: CarWashData): Promise<void> {
        // Validar datos
        const validation = validateCarWashData(carwash);
        if (!validation.valid) {
            throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
        }

        // Generar email único
        const emailSlug = carwash.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        const email = carwash.email || `${emailSlug}@scraped.altocarwash.cl`;

        // Verificar si el usuario/provider ya existe
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
            include: { providerProfile: true },
        });

        if (existingUser?.providerProfile) {
            throw new Error('Unique constraint - Provider already exists');
        }

        // Crear usuario y provider en una transacción
        const userData = mapToUserData(carwash);

        const user = await prisma.user.create({
            data: {
                ...userData,
                email: email, // Asegurar que usamos el email generado
                providerProfile: {
                    create: mapToProviderData(carwash, ''), // userId se asigna automáticamente
                },
            },
            include: {
                providerProfile: true,
            },
        });

        if (!user.providerProfile) {
            throw new Error('Error al crear el perfil de provider');
        }

        // Crear servicios
        const services = mapToServices(carwash, user.providerProfile.id);
        if (services.length > 0) {
            await prisma.service.createMany({
                data: services,
            });
        }

        // Si hay imágenes, crear registros de imágenes
        if (carwash.images && carwash.images.length > 0) {
            const imageData = carwash.images.slice(0, 5).map((url, index) => ({
                providerId: user.providerProfile!.id,
                imageUrl: url,
                displayOrder: index,
                isPrimary: index === 0,
            }));

            await prisma.providerImage.createMany({
                data: imageData,
            });
        }
    }

    /**
     * Importa datos de muestra (primeros 5 registros)
     */
    static async importSample(): Promise<ImportResult> {
        console.log('📦 Importando datos de muestra (primeros 5 registros)...\n');

        const sampleFile = 'sample_carwashes.json';
        const fullFile = 'carwashes.json';
        const filePath = path.join(process.cwd(), 'output', fullFile);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Archivo no encontrado: ${filePath}`);
        }

        // Leer y crear archivo de muestra
        const jsonData = fs.readFileSync(filePath, 'utf-8');
        const carwashes: CarWashData[] = JSON.parse(jsonData);
        const sampleData = carwashes.slice(0, 5);

        // Guardar archivo de muestra
        const samplePath = path.join(process.cwd(), 'output', sampleFile);
        fs.writeFileSync(samplePath, JSON.stringify(sampleData, null, 2), 'utf-8');

        return await this.importFromJSON(sampleFile);
    }

    /**
     * Limpia todos los datos importados del scraper
     */
    static async cleanScrapedData(): Promise<void> {
        console.log('🧹 Limpiando datos scrapeados...\n');

        try {
            // Eliminar usuarios con email que termine en @scraped.altocarwash.cl
            const result = await prisma.user.deleteMany({
                where: {
                    email: {
                        endsWith: '@scraped.altocarwash.cl',
                    },
                },
            });

            console.log(`✅ ${result.count} registros eliminados\n`);
        } catch (error: any) {
            console.error(`❌ Error al limpiar datos: ${error.message}`);
            throw error;
        }
    }

    /**
     * Muestra estadísticas de la base de datos
     */
    static async showStats(): Promise<void> {
        console.log('📊 =============================================');
        console.log('📈 ESTADÍSTICAS DE LA BASE DE DATOS');
        console.log('===============================================\n');

        try {
            const totalUsers = await prisma.user.count();
            const totalProviders = await prisma.provider.count();
            const totalServices = await prisma.service.count();
            const scrapedProviders = await prisma.user.count({
                where: {
                    email: { endsWith: '@scraped.altocarwash.cl' },
                },
            });

            console.log(`👥 Total Usuarios: ${totalUsers}`);
            console.log(`🏪 Total Providers: ${totalProviders}`);
            console.log(`🔧 Total Servicios: ${totalServices}`);
            console.log(`🤖 Providers Scrapeados: ${scrapedProviders}\n`);
        } catch (error: any) {
            console.error(`❌ Error al obtener estadísticas: ${error.message}`);
        }
    }
}

/**
 * Función principal para ejecutar el importador
 */
async function main() {
    try {
        // Verificar argumentos de línea de comandos
        const args = process.argv.slice(2);
        const isSample = args.includes('--sample');
        const isClean = args.includes('--clean');
        const isStats = args.includes('--stats');

        if (isClean) {
            await PrismaImporter.cleanScrapedData();
            return;
        }

        if (isStats) {
            await PrismaImporter.showStats();
            return;
        }

        // Importar datos
        let result: ImportResult;
        if (isSample) {
            result = await PrismaImporter.importSample();
        } else {
            result = await PrismaImporter.importFromJSON();
        }

        // Mostrar resumen
        console.log('\n📊 ============ RESUMEN DE IMPORTACIÓN ============');
        console.log(`✅ Exitosos: ${result.success}`);
        console.log(`⚠️  Omitidos (duplicados): ${result.skipped}`);
        console.log(`❌ Fallidos: ${result.failed}`);
        console.log('===================================================\n');

        if (result.errors.length > 0) {
            console.log('❌ Errores encontrados:');
            result.errors.forEach((err, i) => {
                console.log(`   ${i + 1}. ${err.carwash}: ${err.error}`);
            });
            console.log('');
        }

        // Mostrar estadísticas finales
        await PrismaImporter.showStats();

        console.log('✅ Importación completada!\n');
    } catch (error: any) {
        console.error(`\n❌ Error fatal: ${error.message}`);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    main();
}

export default PrismaImporter;
