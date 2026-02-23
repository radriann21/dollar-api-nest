import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import type { GapResponse } from './interfaces/analytics.interfaces';

/* 
TODO: IMPLEMENTAR DOLAR PROMEDIO PONDERADO, PROBABLEMENTE SE TENGA QUE MANEJAR UN NUEVO CAMPO EN LA BD, TABLA SOURCES

LEER E INVESTIGAR SOBRE MIGRACIONES EN PRISMA PARA REALIZAR EL CAMBIO CORRECTAMENTE
*/

@Injectable()
export class AnalyticsService {
  private readonly DEFAULT_TTL = 3600000;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getActualGap() {
    const cacheKey = 'actual-gap';

    const cached = await this.cacheManager.get<GapResponse>(cacheKey);
    if (cached) return cached;

    const latestBinancePrice = await this.prisma.exchangeRate.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        source: {
          name: 'BINANCE',
        },
      },
    });

    const latestBCVPrice = await this.prisma.exchangeRate.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        source: {
          name: 'BCV',
        },
      },
    });

    if (!latestBCVPrice || !latestBinancePrice) {
      throw new BadRequestException('No data found');
    }

    const gap =
      ((Number(latestBinancePrice.price) - Number(latestBCVPrice.price)) /
        Number(latestBCVPrice.price)) *
      100;

    const fullGapData = {
      gap: `${gap.toFixed(2)}%`,
      latestBCVPrice,
      latestBinancePrice,
    };

    await this.cacheManager.set(cacheKey, fullGapData, this.DEFAULT_TTL);

    return fullGapData;
  }
}
