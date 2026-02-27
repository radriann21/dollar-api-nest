import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { GapResponseDto } from './dto';
import { ExchangeRateResponseDto } from 'src/rates/dto';

@Injectable()
export class AnalyticsService {
  private readonly DEFAULT_TTL = 3600000;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getActualGap(): Promise<GapResponseDto> {
    const cacheKey = 'actual-gap';

    const cached = await this.cacheManager.get<GapResponseDto>(cacheKey);
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

    const fullGapData = plainToInstance(
      GapResponseDto,
      {
        gap: `${gap.toFixed(2)}%`,
        latestBCVPrice: plainToInstance(
          ExchangeRateResponseDto,
          latestBCVPrice,
          { excludeExtraneousValues: true },
        ),
        latestBinancePrice: plainToInstance(
          ExchangeRateResponseDto,
          latestBinancePrice,
          { excludeExtraneousValues: true },
        ),
      },
      { excludeExtraneousValues: true },
    );

    await this.cacheManager.set(cacheKey, fullGapData, this.DEFAULT_TTL);

    return fullGapData;
  }
}
