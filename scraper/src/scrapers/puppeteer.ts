import puppeteer from 'puppeteer';
import { CarWashData } from '../types';
import { config, delay } from '../config';

/**
 * Scraper usando Puppeteer para sitios que requieren JavaScript
 * Útil para Google Maps, Instagram, Facebook Marketplace
 */
export class PuppeteerScraper {
    async scrapeGoogleMaps(): Promise<CarWashData[]> {
        const results: CarWashData[] = [];
        let browser;

        console.log('🚀 Iniciando scraping con Puppeteer...');

        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled',
                    '--lang=es-CL'
                ],
            });

            const page = await browser.newPage();

            // Configurar viewport y user agent
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            const searchQuery = encodeURIComponent(`${config.searchQuery} ${config.comuna} ${config.region} Chile`);
            const url = `https://www.google.com/maps/search/${searchQuery}`;

            console.log(`🌐 Navegando a: ${url}`);

            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Esperar a que cargue la página
            console.log('⏳ Esperando que carguen los resultados...');
            await delay(5000);

            // Intentar varios selectores posibles
            let resultsFound = false;
            const selectors = [
                'a[href*="/maps/place/"]',
                'div[role="feed"] > div > div > a',
                '.Nv2PK',
                'div.Nv2PK a'
            ];

            for (const selector of selectors) {
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    console.log(`✅ Encontrados ${elements.length} resultados con selector: ${selector}`);
                    resultsFound = true;
                    break;
                }
            }

            if (!resultsFound) {
                console.log('⚠️  No se encontraron resultados. Intentando scraping alternativo...');

                // Extraer datos del HTML directamente
                const pageData = await page.evaluate(() => {
                    const items: any[] = [];
                    // @ts-ignore - Este código se ejecuta en el contexto del navegador
                    const links = document.querySelectorAll('a[href*="/maps/place/"]');

                    links.forEach((link: any) => {
                        const href = link.href;
                        const nameMatch = href.match(/\/maps\/place\/([^\/]+)/);
                        if (nameMatch) {
                            items.push({
                                name: decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')),
                                url: href
                            });
                        }
                    });

                    return items;
                });

                console.log(`📋 Encontrados ${pageData.length} lugares desde URLs`);

                for (const item of pageData.slice(0, config.maxResults)) {
                    const carWash: CarWashData = {
                        name: item.name,
                        address: `${config.comuna}, ${config.region}`,
                        comuna: config.comuna,
                        region: config.region,
                        services: ['Lavado general'],
                        source: 'google_puppeteer',
                        sourceUrl: item.url,
                        scrapedAt: new Date(),
                    };

                    results.push(carWash);
                    console.log(`✓ Scrapeado: ${carWash.name}`);
                }

                return results;
            }

            // Scroll para cargar más resultados
            await this.scrollResults(page);

            // Extraer datos más detallados
            const listings = await page.$$('a[href*="/maps/place/"]');

            console.log(`📋 Procesando ${Math.min(listings.length, config.maxResults)} resultados con datos completos...`);

            for (let i = 0; i < Math.min(listings.length, config.maxResults); i++) {
                try {
                    const listing = listings[i];

                    const name = await listing.evaluate((el: any) => {
                        const href = el.href;
                        const match = href.match(/\/maps\/place\/([^\/]+)/);
                        return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
                    });

                    const href = await listing.evaluate((el: any) => el.href);

                    if (name && name.toLowerCase().includes('lavado')) {
                        console.log(`\n🔍 Extrayendo datos completos de: ${name}`);

                        // Hacer clic en el resultado para abrir el panel de detalles
                        await listing.click();
                        await delay(3000); // Esperar a que cargue el panel

                        // Extraer datos detallados del panel
                        const detailedData = await this.extractDetailedInfo(page);

                        const carWash: CarWashData = {
                            name: name.trim(),
                            address: detailedData.address || `${config.comuna}, ${config.region}`,
                            comuna: config.comuna,
                            region: config.region,
                            phone: detailedData.phone,
                            website: detailedData.website,
                            description: detailedData.description,
                            services: detailedData.services || ['Lavado general'],
                            rating: detailedData.rating,
                            reviewCount: detailedData.reviewCount,
                            latitude: detailedData.latitude,
                            longitude: detailedData.longitude,
                            openingHours: detailedData.openingHours,
                            source: 'google_puppeteer',
                            sourceUrl: href,
                            scrapedAt: new Date(),
                        };

                        results.push(carWash);
                        console.log(`✅ Scrapeado completo: ${carWash.name}`);
                        if (detailedData.phone) console.log(`   📞 ${detailedData.phone}`);
                        if (detailedData.website) console.log(`   🌐 ${detailedData.website}`);
                        if (detailedData.rating) console.log(`   ⭐ ${detailedData.rating} (${detailedData.reviewCount || 0} reseñas)`);
                    }

                    await delay(1000);
                } catch (error) {
                    console.log(`⚠️  Error procesando resultado ${i + 1}`);
                }
            }

            return results;
        } catch (error: any) {
            console.error('❌ Error en Puppeteer scraper:', error.message);
            return results;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }

    private async extractDetailedInfo(page: any): Promise<any> {
        try {
            // @ts-ignore - Este código se ejecuta en el contexto del navegador
            const data = await page.evaluate(() => {
                const result: any = {};

                // @ts-ignore
                // Dirección
                const addressButton = Array.from(document.querySelectorAll('button[data-item-id^="address"]')).find(
                    (el: any) => el.getAttribute('data-item-id')?.includes('address')
                );
                if (addressButton) {
                    // @ts-ignore
                    const addressDiv = addressButton.querySelector('div[class*="fontBodyMedium"]');
                    if (addressDiv) result.address = addressDiv.textContent?.trim();
                }

                // @ts-ignore
                // Teléfono
                const phoneButton = Array.from(document.querySelectorAll('button[data-item-id^="phone"]')).find(
                    (el: any) => el.getAttribute('data-item-id')?.includes('phone')
                );
                if (phoneButton) {
                    // @ts-ignore
                    const phoneDiv = phoneButton.querySelector('div[class*="fontBodyMedium"]');
                    if (phoneDiv) result.phone = phoneDiv.textContent?.trim();
                }

                // @ts-ignore
                // Sitio web
                const websiteLink = document.querySelector('a[data-item-id^="authority"]');
                if (websiteLink) {
                    // @ts-ignore
                    result.website = (websiteLink as HTMLAnchorElement).href;
                }

                // @ts-ignore
                // Rating y reseñas
                const ratingDiv = document.querySelector('div[class*="fontDisplayLarge"]');
                if (ratingDiv) {
                    result.rating = parseFloat(ratingDiv.textContent?.trim() || '0');
                }

                // @ts-ignore
                const reviewsSpan = document.querySelector('span[aria-label*="estrellas"]');
                if (reviewsSpan) {
                    const reviewText = reviewsSpan.parentElement?.textContent;
                    const match = reviewText?.match(/\((\d+(?:\.\d+)?[kK]?)\)/);
                    if (match) {
                        let count = match[1].toLowerCase();
                        if (count.includes('k')) {
                            result.reviewCount = parseFloat(count) * 1000;
                        } else {
                            result.reviewCount = parseInt(count);
                        }
                    }
                }

                // @ts-ignore
                // Descripción (si existe)
                const descriptionDiv = document.querySelector('div[class*="fontBodyMedium"][class*="description"]');
                if (descriptionDiv) {
                    result.description = descriptionDiv.textContent?.trim();
                }

                // @ts-ignore
                // Horarios
                const hoursButton = document.querySelector('button[data-item-id^="oh"]');
                if (hoursButton) {
                    // @ts-ignore
                    const hoursTable = document.querySelector('table[class*="fontBodyMedium"]');
                    if (hoursTable) {
                        result.openingHours = [];
                        const rows = hoursTable.querySelectorAll('tr');
                        rows.forEach((row: any) => {
                            const cells = row.querySelectorAll('td');
                            if (cells.length >= 2) {
                                result.openingHours.push({
                                    day: cells[0].textContent?.trim(),
                                    hours: cells[1].textContent?.trim()
                                });
                            }
                        });
                    }
                }

                // @ts-ignore
                // Servicios (extraer de la descripción o categorías)
                const categoriesDiv = document.querySelector('button[jsaction*="category"]');
                if (categoriesDiv) {
                    const categoryText = categoriesDiv.textContent?.trim();
                    if (categoryText) {
                        result.services = [categoryText];
                    }
                }

                return result;
            });

            // Extraer coordenadas de la URL
            const url = await page.url();
            const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordMatch) {
                data.latitude = parseFloat(coordMatch[1]);
                data.longitude = parseFloat(coordMatch[2]);
            }

            // Procesar horarios si existen
            if (data.openingHours && Array.isArray(data.openingHours)) {
                data.openingHours = data.openingHours.map((h: any) => {
                    const hours = h.hours || '';
                    let open = '';
                    let close = '';

                    if (hours.includes('–') || hours.includes('-')) {
                        const parts = hours.split(/[–-]/);
                        open = parts[0]?.trim() || '';
                        close = parts[1]?.trim() || '';
                    } else if (hours.toLowerCase().includes('cerrado')) {
                        open = 'Cerrado';
                        close = 'Cerrado';
                    } else if (hours.toLowerCase().includes('abierto 24')) {
                        open = '00:00';
                        close = '23:59';
                    }

                    return {
                        day: h.day,
                        open,
                        close
                    };
                });
            }

            return data;
        } catch (error) {
            console.log('⚠️  Error extrayendo datos detallados');
            return {};
        }
    }

    private async scrollResults(page: any): Promise<void> {
        const scrollContainer = await page.$('[role="feed"]');

        if (scrollContainer) {
            for (let i = 0; i < 3; i++) {
                await page.evaluate((element: any) => {
                    element.scrollTop = element.scrollHeight;
                }, scrollContainer);

                await delay(2000);
            }
        }
    }
}