import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Mapeo de servicios en espaÃ±ol a ServiceType enum
const SERVICE_TYPE_MAP = {
    'lavado bÃ¡sico': 'BASIC_WASH',
    'lavado completo': 'BASIC_WASH',
    'lavado premium': 'PREMIUM_WASH',
    'encerado': 'WAXING',
    'detailing': 'DETAILING',
    'aspirado': 'INTERIOR_CLEAN',
    'motor': 'ENGINE_CLEAN',
    'tapiz': 'INTERIOR_CLEAN',
    'neumÃ¡ticos': 'TIRE_CLEAN',
    'pulido': 'PAINT_PROTECTION',
    'ozono': 'INTERIOR_CLEAN',
    'express': 'BASIC_WASH'
};

// Precios base por tipo de servicio (en CLP)
const BASE_PRICES = {
    'BASIC_WASH': 8000,
    'PREMIUM_WASH': 15000,
    'DETAILING': 45000,
    'WAXING': 25000,
    'INTERIOR_CLEAN': 12000,
    'ENGINE_CLEAN': 18000,
    'TIRE_CLEAN': 8000,
    'PAINT_PROTECTION': 35000,
    'CERAMIC_COATING': 80000
};

function getServiceType(serviceName) {
    const normalizedName = serviceName.toLowerCase().trim();
    return SERVICE_TYPE_MAP[normalizedName] || 'BASIC_WASH';
}

function generatePrice(serviceType) {
    const basePrice = BASE_PRICES[serviceType] || 10000;
    // Agregar variaciÃ³n de Â±2000
    const variation = Math.floor(Math.random() * 4001) - 2000;
    return basePrice + variation;
}

async function main() {
    const jsonPath = path.join(process.cwd(), '..', 'scraper', 'output', 'all_carwashes_combined.json');
    
    console.log('í³‚ Leyendo archivo:', jsonPath);
    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    const carwashesData = JSON.parse(fileContent);
    
    console.log(`\níº€ Iniciando importaciÃ³n de ${carwashesData.length} autolavados...\n`);

    let importedCount = 0;
    let servicesCount = 0;
    let emailCounter = 0;

    for (const carwash of carwashesData) {
        try {
            // Extraer firstName y lastName del nombre
            const nameParts = carwash.name.trim().split(' ');
            const firstName = nameParts[0] || 'Autolavado';
            const lastName = nameParts.slice(1).join(' ') || 'Chile';

            // Generar email Ãºnico para evitar duplicados (especialmente para "COPEC" repetido)
            const emailSanitized = carwash.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const email = `${emailSanitized}${emailCounter}@autolavado.cl`;
            emailCounter++;

            // Crear usuario (sin clerkId porque es scrapeado)
            const user = await prisma.user.create({
                data: {
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                    role: 'PROVIDER'
                }
            });

            // Crear provider con todos los campos requeridos
            const provider = await prisma.provider.create({
                data: {
                    userId: user.id,
                    businessName: carwash.name,
                    businessType: 'Autolavado',
                    phone: carwash.phone || '+56 2 0000 0000',
                    email: email,
                    address: carwash.address,
                    latitude: carwash.latitude || -33.4489,
                    longitude: carwash.longitude || -70.6693,
                    city: carwash.comuna,
                    region: carwash.region,
                    operatingHours: {
                        lunes: '09:00-19:00',
                        martes: '09:00-19:00',
                        miÃ©rcoles: '09:00-19:00',
                        jueves: '09:00-19:00',
                        viernes: '09:00-19:00',
                        sÃ¡bado: '09:00-14:00',
                        domingo: 'Cerrado'
                    },
                    website: carwash.website || null,
                    rating: carwash.rating || 0,
                    reviewCount: carwash.reviewCount || 0
                }
            });

            // Crear servicios
            for (const serviceName of carwash.services) {
                const serviceType = getServiceType(serviceName);
                const price = generatePrice(serviceType);

                await prisma.service.create({
                    data: {
                        providerId: provider.id,
                        name: serviceName.charAt(0).toUpperCase() + serviceName.slice(1),
                        description: `Servicio de ${serviceName} profesional`,
                        price: price,
                        duration: 60,
                        type: serviceType
                    }
                });
                servicesCount++;
            }

            importedCount++;
            if (importedCount % 50 === 0) {
                console.log(`âœ… Progreso: ${importedCount}/${carwashesData.length} autolavados importados`);
            }

        } catch (error) {
            console.error(`âŒ Error importando ${carwash.name}:`, error.message);
        }
    }

    console.log(`\ní¾‰ IMPORTACIÃ“N COMPLETADA`);
    console.log(`===========================`);
    console.log(`âœ… ${importedCount} autolavados importados`);
    console.log(`âœ… ${servicesCount} servicios creados`);
    console.log(`í³Š Promedio: ${(servicesCount / importedCount).toFixed(2)} servicios por autolavado`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
