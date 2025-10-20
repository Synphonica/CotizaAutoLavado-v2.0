import axios from 'axios';
import * as cheerio from 'cheerio';
import { CarWashData } from '../types';
import { config, delay } from '../config';

/**
 * Scraper para Yapo.cl - Clasificados de Chile
 * Busca anuncios de autolavados en la sección de servicios
 */
export class YapoScraper {
    private baseUrl = 'https://www.yapo.cl';

    async scrape(): Promise<CarWashData[]> {
        const results: CarWashData[] = [];

        console.log('🔍 Iniciando scraping de Yapo.cl...');

        try {
            // URL de búsqueda en Yapo para servicios de autolavado
            const searchUrl = `${this.baseUrl}/region_metropolitana/servicios/autolavado`;

            console.log(`🌐 Scrapeando: ${searchUrl}`);

            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                },
            });

            const $ = cheerio.load(response.data);

            // Selector para los anuncios (esto puede cambiar, revisar HTML de Yapo)
            const listings = $('.listing');

            console.log(`📋 Encontrados ${listings.length} anuncios`);

            for (let i = 0; i < Math.min(listings.length, config.maxResults); i++) {
                const listing = listings.eq(i);

                const title = listing.find('.title').text().trim();
                const description = listing.find('.description').text().trim();
                const price = listing.find('.price').text().trim();
                const location = listing.find('.location').text().trim();
                const link = listing.find('a').attr('href');

                if (title && link) {
                    const carWash: CarWashData = {
                        name: title,
                        address: location || '',
                        comuna: this.extractComuna(location),
                        region: 'Región Metropolitana',
                        description: description,
                        services: this.extractServices(title, description),
                        prices: price ? [{ serviceName: 'General', price: this.parsePrice(price) }] : undefined,
                        source: 'yapo',
                        sourceUrl: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
                        scrapedAt: new Date(),
                    };

                    results.push(carWash);
                    console.log(`✓ Scrapeado: ${carWash.name}`);
                }

                await delay(config.delayBetweenRequests);
            }

            return results;
        } catch (error: any) {
            console.error('❌ Error en Yapo scraper:', error.message);
            return results;
        }
    }

    private extractComuna(location: string): string {
        // Buscar si contiene "Maipú" u otras comunas
        const comunas = ['Maipú', 'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa'];
        for (const comuna of comunas) {
            if (location.toLowerCase().includes(comuna.toLowerCase())) {
                return comuna;
            }
        }
        return config.comuna;
    }

    private extractServices(title: string, description: string): string[] {
        const text = `${title} ${description}`.toLowerCase();
        const services: string[] = [];

        const serviceKeywords = {
            'lavado exterior': ['lavado', 'exterior', 'básico'],
            'lavado completo': ['completo', 'interior y exterior'],
            'encerado': ['encerado', 'cera', 'pulido'],
            'detallado': ['detailing', 'detallado', 'premium'],
            'limpieza de motor': ['motor', 'desengrase'],
            'aspirado': ['aspirado', 'vacío'],
        };

        for (const [service, keywords] of Object.entries(serviceKeywords)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                services.push(service);
            }
        }

        return services.length > 0 ? services : ['Lavado general'];
    }

    private parsePrice(priceText: string): number {
        // Extraer número del texto de precio
        const match = priceText.match(/\d+[\d.,]*/);
        if (match) {
            return parseInt(match[0].replace(/[.,]/g, ''));
        }
        return 0;
    }
}