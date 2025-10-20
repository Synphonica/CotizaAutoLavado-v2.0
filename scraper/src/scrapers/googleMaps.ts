import axios from 'axios';
import * as cheerio from 'cheerio';
import { CarWashData } from '../types';
import { config, delay } from '../config';

/**
 * Scraper para Google Maps usando búsqueda web
 * Nota: Para producción, considera usar Google Places API (requiere API key)
 */
export class GoogleMapsScraper {
    private baseUrl = 'https://www.google.com/maps/search/';

    async scrape(): Promise<CarWashData[]> {
        const results: CarWashData[] = [];

        console.log('🔍 Iniciando scraping de Google Maps...');
        console.log(`📍 Buscando: ${config.searchQuery} en ${config.comuna}, ${config.region}`);

        try {
            const searchQuery = `${config.searchQuery}+${config.comuna}+${config.region}+Chile`;
            const url = `${this.baseUrl}${encodeURIComponent(searchQuery)}`;

            console.log(`🌐 URL: ${url}`);
            console.log('⚠️  Nota: Google Maps requiere JavaScript. Considera usar Google Places API o Puppeteer.');

            // Ejemplo de estructura de datos a recopilar
            const exampleData: CarWashData = {
                name: 'Ejemplo: AutoLavado Express Maipú',
                address: 'Av. Pajaritos 1234, Maipú',
                comuna: 'Maipú',
                region: 'Región Metropolitana',
                phone: '+56912345678',
                services: ['Lavado exterior', 'Lavado completo', 'Encerado'],
                rating: 4.5,
                reviewCount: 120,
                latitude: -33.5144,
                longitude: -70.7634,
                source: 'google',
                sourceUrl: url,
                scrapedAt: new Date(),
            };

            console.log('💡 Ejemplo de datos que se pueden obtener:');
            console.log(JSON.stringify(exampleData, null, 2));

            return results;
        } catch (error) {
            console.error('❌ Error en Google Maps scraper:', error);
            return results;
        }
    }
}

/**
 * Scraper usando Google Places API (recomendado)
 */
export class GooglePlacesAPIScraper {
    private apiKey: string;
    private baseUrl = 'https://maps.googleapis.com/maps/api/place';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async searchPlaces(): Promise<CarWashData[]> {
        const results: CarWashData[] = [];

        if (!this.apiKey || this.apiKey === 'your_google_maps_api_key_here') {
            console.log('⚠️  Google Maps API Key no configurada.');
            console.log('📝 Para usar este scraper:');
            console.log('1. Obtén una API key en: https://console.cloud.google.com/');
            console.log('2. Habilita Places API');
            console.log('3. Agrega la key al archivo .env');
            return results;
        }

        try {
            console.log('🔍 Buscando en Google Places API...');

            const searchUrl = `${this.baseUrl}/textsearch/json`;
            const params = {
                query: `${config.searchQuery} ${config.comuna} ${config.region} Chile`,
                key: this.apiKey,
                language: 'es',
                region: 'cl',
            };

            const response = await axios.get(searchUrl, { params });
            const places = response.data.results || [];

            console.log(`✅ Encontrados ${places.length} lugares`);

            for (const place of places.slice(0, config.maxResults)) {
                await delay(config.delayBetweenRequests);

                const details = await this.getPlaceDetails(place.place_id);

                const carWash: CarWashData = {
                    name: place.name,
                    address: place.formatted_address || '',
                    comuna: config.comuna,
                    region: config.region,
                    phone: details?.formatted_phone_number,
                    website: details?.website,
                    description: details?.editorial_summary?.overview,
                    services: this.extractServices(details?.types || []),
                    rating: place.rating,
                    reviewCount: place.user_ratings_total,
                    latitude: place.geometry?.location?.lat,
                    longitude: place.geometry?.location?.lng,
                    openingHours: this.parseOpeningHours(details?.opening_hours),
                    source: 'google',
                    sourceUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
                    scrapedAt: new Date(),
                };

                results.push(carWash);
                console.log(`✓ Scrapeado: ${carWash.name}`);
            }

            return results;
        } catch (error: any) {
            console.error('❌ Error en Google Places API:', error.message);
            return results;
        }
    }

    private async getPlaceDetails(placeId: string): Promise<any> {
        try {
            const detailsUrl = `${this.baseUrl}/details/json`;
            const params = {
                place_id: placeId,
                key: this.apiKey,
                fields: 'name,formatted_address,formatted_phone_number,website,opening_hours,types,editorial_summary',
                language: 'es',
            };

            const response = await axios.get(detailsUrl, { params });
            return response.data.result;
        } catch (error) {
            console.error(`Error obteniendo detalles de ${placeId}`);
            return null;
        }
    }

    private extractServices(types: string[]): string[] {
        const serviceMap: { [key: string]: string } = {
            'car_wash': 'Lavado de autos',
            'car_repair': 'Reparación',
            'car_dealer': 'Venta de autos',
        };

        return types
            .filter(type => serviceMap[type])
            .map(type => serviceMap[type]);
    }

    private parseOpeningHours(openingHours: any): CarWashData['openingHours'] {
        if (!openingHours?.weekday_text) return undefined;

        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        return openingHours.weekday_text.map((text: string, index: number) => {
            const match = text.match(/(\d+:\d+)\s*–\s*(\d+:\d+)/);
            return {
                day: days[index] || '',
                open: match?.[1] || '',
                close: match?.[2] || '',
            };
        });
    }
}