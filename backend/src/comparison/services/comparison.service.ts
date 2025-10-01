import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CompareQueryDto, ComparisonResponseDto } from '../dto/compare-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ComparisonService {
  private cache = new Map<string, { expiresAt: number; data: ComparisonResponseDto }>();
  private defaultTtlMs = 30 * 1000; // 30s

  constructor(private readonly prisma: PrismaService) { }

  async compare(query: CompareQueryDto): Promise<ComparisonResponseDto> {
    const {
      search,
      type,
      category,
      status,
      minPrice,
      maxPrice,
      latitude,
      longitude,
      maxDistanceKm,
      isAvailable,
      city,
      region,
      sortBy = 'effectivePrice',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = query;

    const where: Prisma.ServiceWhereInput = {
      status,
      isAvailable,
      type,
      category,
      provider: {
        city,
        region,
      },
      AND: [
        search
          ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
              { category: { contains: search, mode: 'insensitive' } },
            ],
          }
          : {},
        minPrice ? { price: { gte: new Prisma.Decimal(minPrice) } } : {},
        maxPrice ? { price: { lte: new Prisma.Decimal(maxPrice) } } : {},
      ],
    };

    const skip = (page - 1) * limit;

    const cacheKey = JSON.stringify({ where, page, limit, sortBy, sortOrder, latitude, longitude, maxDistanceKm });
    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }

    const [total, services] = await this.prisma.$transaction([
      this.prisma.service.count({ where }),
      this.prisma.service.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              rating: true,
              latitude: true,
              longitude: true,
              city: true,
              region: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const toRad = (v: number) => (v * Math.PI) / 180;
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const results = services
      .map((s) => {
        const price = Number((s as any).price);
        const discountedPrice = (s as any).discountedPrice != null ? Number((s as any).discountedPrice) : null;
        const effectivePrice = discountedPrice != null ? discountedPrice : price;
        const discountPercent = discountedPrice != null ? Math.round(((price - discountedPrice) / price) * 100) : null;

        const distanceKm = latitude != null && longitude != null
          ? haversine(latitude, longitude, (s as any).provider.latitude, (s as any).provider.longitude)
          : undefined;

        // Score combinado (0..1 aprox). Normalizaciones simples.
        const normalizedPrice = 1 / (1 + effectivePrice); // menor precio => mayor valor
        const normalizedDistance = distanceKm != null ? 1 / (1 + distanceKm) : 0.5; // más cerca => mayor
        const normalizedRating = ((s as any).provider.rating ?? 0) / 5; // 0..1
        const normalizedDiscount = discountPercent != null ? discountPercent / 100 : 0; // 0..1

        const weightPrice = 0.45;
        const weightDistance = 0.2;
        const weightRating = 0.25;
        const weightDiscount = 0.1;

        const score =
          normalizedPrice * weightPrice +
          normalizedDistance * weightDistance +
          normalizedRating * weightRating +
          normalizedDiscount * weightDiscount;

        return {
          id: s.id,
          name: s.name,
          type: s.type,
          price,
          discountedPrice,
          effectivePrice,
          currency: s.currency,
          duration: s.duration,
          category: s.category,
          provider: {
            id: (s as any).provider.id,
            businessName: (s as any).provider.businessName,
            rating: (s as any).provider.rating,
            latitude: (s as any).provider.latitude,
            longitude: (s as any).provider.longitude,
            city: (s as any).provider.city,
            region: (s as any).provider.region,
          },
          distanceKm,
          discountPercent,
          score,
        };
      })
      .filter((item) => (maxDistanceKm != null && item.distanceKm != null ? item.distanceKm <= maxDistanceKm : true));

    const sorted = [...results].sort((a, b) => {
      const dir = sortOrder === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'distance':
          return dir * (((a.distanceKm ?? Infinity) as number) - ((b.distanceKm ?? Infinity) as number));
        case 'rating':
          return dir * (a.provider.rating - b.provider.rating);
        case 'discount':
          return dir * (((b.discountPercent ?? 0) as number) - ((a.discountPercent ?? 0) as number));
        case 'duration':
          return dir * (a.duration - b.duration);
        case 'effectivePrice':
        default:
          return dir * (a.effectivePrice - b.effectivePrice);
        case 'score':
          return dir * (((a.score ?? 0) as number) - ((b.score ?? 0) as number));
      }
    });

    const response: ComparisonResponseDto = {
      page,
      limit,
      total,
      results: sorted,
    };

    this.cache.set(cacheKey, { expiresAt: now + this.defaultTtlMs, data: response });
    return response;
  }
}
