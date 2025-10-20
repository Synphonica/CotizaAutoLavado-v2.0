import { GooglePlacesAPIScraper, GoogleMapsScraper } from './scrapers/googleMaps';
import { YapoScraper } from './scrapers/yapo';
import { PuppeteerScraper } from './scrapers/puppeteer';
import { DataExporter } from './exporters';
import { CarWashData } from './types';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    console.log('🚀 =============================================');
    console.log('🚗 ALTO CARWASH - SCRAPER DE AUTOLAVADOS');
    console.log('📍 Región: Metropolitana - Comuna: Maipú');
    console.log('===============================================\n');

    const allData: CarWashData[] = [];

    // 1. Scraper de Yapo.cl (más fácil, no requiere API key)
    console.log('\n📌 1. Scraping Yapo.cl...');
    try {
        const yapoScraper = new YapoScraper();
        const yapoData = await yapoScraper.scrape();
        allData.push(...yapoData);
        console.log(`✅ Yapo: ${yapoData.length} autolavados encontrados\n`);
    } catch (error: any) {
        console.error(`❌ Error en Yapo: ${error.message}\n`);
    }

    // 2. Google Places API (si tienes API key)
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey && apiKey !== 'your_google_maps_api_key_here') {
        console.log('\n📌 2. Scraping Google Places API...');
        try {
            const googleScraper = new GooglePlacesAPIScraper(apiKey);
            const googleData = await googleScraper.searchPlaces();
            allData.push(...googleData);
            console.log(`✅ Google: ${googleData.length} autolavados encontrados\n`);
        } catch (error: any) {
            console.error(`❌ Error en Google: ${error.message}\n`);
        }
    } else {
        console.log('\n⚠️  Google Maps API Key no configurada. Saltando...\n');
    }

    // 3. Puppeteer (más lento pero efectivo)
    const usePuppeteer = process.argv.includes('--puppeteer');
    if (usePuppeteer) {
        console.log('\n📌 3. Scraping con Puppeteer (Google Maps)...');
        try {
            const puppeteerScraper = new PuppeteerScraper();
            const puppeteerData = await puppeteerScraper.scrapeGoogleMaps();
            allData.push(...puppeteerData);
            console.log(`✅ Puppeteer: ${puppeteerData.length} autolavados encontrados\n`);
        } catch (error: any) {
            console.error(`❌ Error en Puppeteer: ${error.message}\n`);
        }
    }

    // Eliminar duplicados
    const uniqueData = removeDuplicates(allData);

    // Mostrar resumen
    console.log('\n📊 ============ RESUMEN ============');
    console.log(`Total scrapeado: ${allData.length}`);
    console.log(`Total único: ${uniqueData.length}`);
    console.log(`Duplicados removidos: ${allData.length - uniqueData.length}`);
    console.log('=====================================\n');

    // Exportar datos
    if (uniqueData.length > 0) {
        console.log('💾 Exportando datos...\n');

        DataExporter.exportToJSON(uniqueData);
        DataExporter.exportToExcel(uniqueData);
        DataExporter.exportToCSV(uniqueData);
        DataExporter.exportToSQL(uniqueData);

        console.log('\n✅ ¡Scraping completado exitosamente!');
        console.log('📁 Revisa la carpeta "output" para los archivos generados.');
    } else {
        console.log('⚠️  No se encontraron datos para exportar.');
        console.log('💡 Sugerencias:');
        console.log('   - Configura Google Maps API Key en .env');
        console.log('   - Usa --puppeteer para scraping más profundo');
        console.log('   - Revisa tu conexión a internet');
    }
}

function removeDuplicates(data: CarWashData[]): CarWashData[] {
    const seen = new Set<string>();
    return data.filter(carwash => {
        const key = `${carwash.name.toLowerCase()}-${carwash.address.toLowerCase()}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

// Manejar argumentos de línea de comandos
if (require.main === module) {
    main().catch((error) => {
        console.error('❌ Error fatal:', error);
        process.exit(1);
    });
}

export { main };