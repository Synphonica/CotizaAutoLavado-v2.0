/**
 * SCRIPT DE EJEMPLO: Datos de Muestra para Testing
 * 
 * Este script genera datos de ejemplo de autolavados en Maipú
 * para probar el sistema sin necesidad de hacer scraping real.
 */

import { DataExporter } from './exporters';
import { CarWashData } from './types';

const sampleData: CarWashData[] = [
    {
        name: 'AutoLavado Express Maipú',
        address: 'Av. Pajaritos 2145, Maipú',
        comuna: 'Maipú',
        region: 'Región Metropolitana',
        phone: '+56 2 2531 4567',
        email: 'contacto@expressmaipu.cl',
        website: 'www.autolavadoexpress.cl',
        description: 'Lavado express de autos con tecnología de punta. Servicio rápido y eficiente.',
        services: ['Lavado exterior', 'Lavado completo', 'Encerado', 'Aspirado'],
        prices: [
            { serviceName: 'Lavado exterior', price: 8000, duration: 20 },
            { serviceName: 'Lavado completo', price: 15000, duration: 45 },
            { serviceName: 'Encerado', price: 12000, duration: 30 },
        ],
        rating: 4.5,
        reviewCount: 127,
        latitude: -33.5144,
        longitude: -70.7634,
        openingHours: [
            { day: 'Lunes', open: '09:00', close: '19:00' },
            { day: 'Martes', open: '09:00', close: '19:00' },
            { day: 'Miércoles', open: '09:00', close: '19:00' },
            { day: 'Jueves', open: '09:00', close: '19:00' },
            { day: 'Viernes', open: '09:00', close: '19:00' },
            { day: 'Sábado', open: '10:00', close: '18:00' },
            { day: 'Domingo', open: '10:00', close: '14:00' },
        ],
        source: 'manual',
        sourceUrl: 'https://example.com/autolavado-express',
        scrapedAt: new Date(),
    },
    {
        name: 'Car Wash Center',
        address: 'Av. 5 de Abril 1523, Maipú',
        comuna: 'Maipú',
        region: 'Región Metropolitana',
        phone: '+56 9 8765 4321',
        description: 'Especialistas en detailing y cuidado automotriz premium.',
        services: ['Lavado completo', 'Detallado completo', 'Pulido', 'Tratamiento cerámico'],
        prices: [
            { serviceName: 'Lavado completo', price: 18000, duration: 60 },
            { serviceName: 'Detallado completo', price: 45000, duration: 180 },
        ],
        rating: 4.8,
        reviewCount: 89,
        latitude: -33.5089,
        longitude: -70.7698,
        source: 'manual',
        sourceUrl: 'https://example.com/car-wash-center',
        scrapedAt: new Date(),
    },
    {
        name: 'Lavado Rápido Los Pajaritos',
        address: 'Camino a Melipilla 8765, Maipú',
        comuna: 'Maipú',
        region: 'Región Metropolitana',
        phone: '+56 2 2543 7890',
        description: 'Lavado rápido y económico. Atención de lunes a domingo.',
        services: ['Lavado exterior', 'Aspirado', 'Limpieza de motor'],
        prices: [
            { serviceName: 'Lavado exterior', price: 6000, duration: 15 },
            { serviceName: 'Aspirado', price: 4000, duration: 10 },
        ],
        rating: 4.2,
        reviewCount: 54,
        latitude: -33.5201,
        longitude: -70.7890,
        source: 'manual',
        sourceUrl: 'https://example.com/lavado-pajaritos',
        scrapedAt: new Date(),
    },
    {
        name: 'Eco Wash Maipú',
        address: 'Av. Américo Vespucio 4321, Maipú',
        comuna: 'Maipú',
        region: 'Región Metropolitana',
        phone: '+56 9 5555 1234',
        website: 'www.ecowashmaipu.cl',
        description: 'Lavado ecológico con productos biodegradables. Cuidamos tu auto y el medio ambiente.',
        services: ['Lavado ecológico', 'Encerado natural', 'Limpieza interior'],
        prices: [
            { serviceName: 'Lavado ecológico', price: 12000, duration: 30 },
        ],
        rating: 4.6,
        reviewCount: 73,
        latitude: -33.5078,
        longitude: -70.7456,
        source: 'manual',
        sourceUrl: 'https://example.com/eco-wash',
        scrapedAt: new Date(),
    },
    {
        name: 'AutoSpa Premium',
        address: 'Las Acacias 2345, Maipú',
        comuna: 'Maipú',
        region: 'Región Metropolitana',
        phone: '+56 2 2567 8901',
        email: 'info@autospamaipu.cl',
        website: 'www.autospamaipu.cl',
        description: 'Spa automotriz de lujo. Servicios premium para tu vehículo.',
        services: ['Lavado premium', 'Detallado interior', 'Pulido profesional', 'Tratamiento cuero'],
        prices: [
            { serviceName: 'Lavado premium', price: 25000, duration: 90 },
            { serviceName: 'Detallado interior', price: 35000, duration: 120 },
            { serviceName: 'Pulido profesional', price: 50000, duration: 180 },
        ],
        rating: 4.9,
        reviewCount: 156,
        latitude: -33.5167,
        longitude: -70.7545,
        openingHours: [
            { day: 'Lunes', open: '08:00', close: '20:00' },
            { day: 'Martes', open: '08:00', close: '20:00' },
            { day: 'Miércoles', open: '08:00', close: '20:00' },
            { day: 'Jueves', open: '08:00', close: '20:00' },
            { day: 'Viernes', open: '08:00', close: '20:00' },
            { day: 'Sábado', open: '09:00', close: '19:00' },
            { day: 'Domingo', open: 'Cerrado', close: 'Cerrado' },
        ],
        source: 'manual',
        sourceUrl: 'https://example.com/autospa-premium',
        scrapedAt: new Date(),
    },
];

function generateSampleData() {
    console.log('📝 Generando datos de ejemplo...\n');
    console.log(`✅ Total de autolavados: ${sampleData.length}\n`);

    // Exportar a todos los formatos
    console.log('💾 Exportando datos...\n');

    DataExporter.exportToJSON(sampleData, 'sample_carwashes.json');
    DataExporter.exportToExcel(sampleData, 'sample_carwashes.xlsx');
    DataExporter.exportToCSV(sampleData, 'sample_carwashes.csv');
    DataExporter.exportToSQL(sampleData, 'sample_insert_carwashes.sql');

    console.log('\n✅ ¡Datos de ejemplo generados exitosamente!');
    console.log('📁 Revisa la carpeta "output" para los archivos.');
    console.log('\n💡 Estos son datos de ejemplo. Para datos reales, ejecuta:');
    console.log('   npm start');
}

if (require.main === module) {
    generateSampleData();
}