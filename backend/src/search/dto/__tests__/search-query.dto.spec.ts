import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SearchQueryDto } from '../search-query.dto';
import { ServiceType } from '@prisma/client';

describe('SearchQueryDto', () => {
    describe('query field', () => {
        it('should accept valid query string', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado premium',
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should trim whitespace from query', () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: '  lavado premium  ',
            });

            expect(dto.query).toBe('lavado premium');
        });

        it('should reject empty query', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: '',
            });

            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
        });

        it('should reject query exceeding max length', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'a'.repeat(201),
            });

            const errors = await validate(dto);
            const queryErrors = errors.find(e => e.property === 'query');
            expect(queryErrors).toBeDefined();
            expect(queryErrors?.constraints).toHaveProperty('maxLength');
        });

        it('should accept query at max length', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'a'.repeat(200),
            });

            const errors = await validate(dto);
            const queryErrors = errors.find(e => e.property === 'query');
            expect(queryErrors).toBeUndefined();
        });
    });

    describe('location fields', () => {
        it('should accept valid latitude and longitude', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                latitude: -33.4489,
                longitude: -70.6693,
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should convert string numbers to numbers', () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                latitude: '-33.4489',
                longitude: '-70.6693',
            });

            expect(typeof dto.latitude).toBe('number');
            expect(typeof dto.longitude).toBe('number');
            expect(dto.latitude).toBe(-33.4489);
            expect(dto.longitude).toBe(-70.6693);
        });

        it('should reject invalid latitude', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                latitude: 100, // Fuera de rango -90 a 90
                longitude: -70.6693,
            });

            const errors = await validate(dto);
            const latErrors = errors.find(e => e.property === 'latitude');
            expect(latErrors).toBeDefined();
        });

        it('should reject invalid longitude', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                latitude: -33.4489,
                longitude: 200, // Fuera de rango -180 a 180
            });

            const errors = await validate(dto);
            const lngErrors = errors.find(e => e.property === 'longitude');
            expect(lngErrors).toBeDefined();
        });
    });

    describe('radius field', () => {
        it('should accept valid radius', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                radius: 10,
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should use default radius if not provided', () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
            });

            expect(dto.radius).toBe(10);
        });

        it('should reject radius below minimum', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                radius: 0,
            });

            const errors = await validate(dto);
            const radiusErrors = errors.find(e => e.property === 'radius');
            expect(radiusErrors).toBeDefined();
            expect(radiusErrors?.constraints).toHaveProperty('min');
        });

        it('should reject radius above maximum', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                radius: 101,
            });

            const errors = await validate(dto);
            const radiusErrors = errors.find(e => e.property === 'radius');
            expect(radiusErrors).toBeDefined();
            expect(radiusErrors?.constraints).toHaveProperty('max');
        });

        it('should accept radius at boundaries', async () => {
            const dtoMin = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                radius: 1,
            });

            const dtoMax = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                radius: 100,
            });

            const errorsMin = await validate(dtoMin);
            const errorsMax = await validate(dtoMax);

            expect(errorsMin.length).toBe(0);
            expect(errorsMax.length).toBe(0);
        });
    });

    describe('city and region fields', () => {
        it('should trim city and region', () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                city: '  Santiago  ',
                region: '  Metropolitana  ',
            });

            expect(dto.city).toBe('Santiago');
            expect(dto.region).toBe('Metropolitana');
        });

        it('should reject city exceeding max length', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                city: 'a'.repeat(101),
            });

            const errors = await validate(dto);
            const cityErrors = errors.find(e => e.property === 'city');
            expect(cityErrors).toBeDefined();
        });

        it('should reject region exceeding max length', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                region: 'a'.repeat(101),
            });

            const errors = await validate(dto);
            const regionErrors = errors.find(e => e.property === 'region');
            expect(regionErrors).toBeDefined();
        });
    });

    describe('serviceType field', () => {
        it('should accept valid ServiceType enum', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                serviceType: ServiceType.PREMIUM_WASH,
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should reject invalid ServiceType', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                serviceType: 'INVALID_TYPE' as any,
            });

            const errors = await validate(dto);
            const typeErrors = errors.find(e => e.property === 'serviceType');
            expect(typeErrors).toBeDefined();
        });

        it('should accept array of ServiceTypes', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                serviceTypes: [ServiceType.PREMIUM_WASH, ServiceType.DETAILING],
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });
    });

    describe('price fields', () => {
        it('should accept valid price range', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                minPrice: 5000,
                maxPrice: 50000,
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should reject negative prices', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                minPrice: -1000,
            });

            const errors = await validate(dto);
            const priceErrors = errors.find(e => e.property === 'minPrice');
            expect(priceErrors).toBeDefined();
            expect(priceErrors?.constraints).toHaveProperty('min');
        });

        it('should accept zero as minimum price', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                minPrice: 0,
            });

            const errors = await validate(dto);
            const priceErrors = errors.find(e => e.property === 'minPrice');
            expect(priceErrors).toBeUndefined();
        });
    });

    describe('rating field', () => {
        it('should accept valid rating', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                minRating: 4.5,
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should reject rating below 1', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                minRating: 0,
            });

            const errors = await validate(dto);
            const ratingErrors = errors.find(e => e.property === 'minRating');
            expect(ratingErrors).toBeDefined();
        });

        it('should reject rating above 5', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                minRating: 6,
            });

            const errors = await validate(dto);
            const ratingErrors = errors.find(e => e.property === 'minRating');
            expect(ratingErrors).toBeDefined();
        });
    });

    describe('pagination fields', () => {
        it('should use default page and limit', () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
            });

            expect(dto.page).toBe(1);
            expect(dto.limit).toBe(20);
        });

        it('should accept valid page and limit', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                page: 2,
                limit: 50,
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should reject page below 1', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                page: 0,
            });

            const errors = await validate(dto);
            const pageErrors = errors.find(e => e.property === 'page');
            expect(pageErrors).toBeDefined();
        });

        it('should reject limit above 100', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                limit: 101,
            });

            const errors = await validate(dto);
            const limitErrors = errors.find(e => e.property === 'limit');
            expect(limitErrors).toBeDefined();
        });
    });

    describe('boolean flags', () => {
        it('should accept boolean flags', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                availableOnly: true,
                verifiedOnly: true,
                hasDiscounts: false,
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should use default values for boolean flags', () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
            });

            expect(dto.availableOnly).toBe(true);
            expect(dto.verifiedOnly).toBe(false);
            expect(dto.hasDiscounts).toBe(false);
        });
    });

    describe('sorting fields', () => {
        it('should accept valid sortBy and sortOrder', async () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
                sortBy: 'price',
                sortOrder: 'desc',
            });

            const errors = await validate(dto);
            expect(errors.length).toBe(0);
        });

        it('should use default sorting', () => {
            const dto = plainToInstance(SearchQueryDto, {
                query: 'lavado',
            });

            expect(dto.sortBy).toBe('relevance');
            expect(dto.sortOrder).toBe('asc');
        });
    });
});
