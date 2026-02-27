import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import {
  SourceResponseDto,
  ExchangeRateResponseDto,
  LatestPricesResponseDto,
} from './dto';
import { DEFAULT_TTL } from 'src/utils/constants';

@Injectable()
export class RatesService {
  private readonly logger = new Logger(RatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async getOrSetPrice(
    sourceName: string,
  ): Promise<ExchangeRateResponseDto | null> {
    const cacheKey = `latestPrice:${sourceName.toUpperCase()}`;

    const cached =
      await this.cacheManager.get<ExchangeRateResponseDto>(cacheKey);
    if (cached) return cached;

    try {
      const lastPrice = await this.prisma.exchangeRate.findFirst({
        where: { source: { name: sourceName } },
        orderBy: { createdAt: 'desc' },
      });

      if (lastPrice) {
        const plainObject = {
          ...lastPrice,
          price: lastPrice.price.toString(),
        };
        const dto = plainToInstance(ExchangeRateResponseDto, plainObject, {
          excludeExtraneousValues: true,
        });
        await this.cacheManager.set(cacheKey, dto, DEFAULT_TTL);
        return dto;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error getting last ${sourceName} price`, error);
      throw new InternalServerErrorException(`Error database: ${sourceName}`);
    }
  }

  async getSources(): Promise<SourceResponseDto[]> {
    const sources = await this.prisma.sources.findMany();
    return plainToInstance(SourceResponseDto, sources, {
      excludeExtraneousValues: true,
    });
  }

  async getLastBCVPrice(): Promise<ExchangeRateResponseDto | null> {
    return this.getOrSetPrice('BCV');
  }

  async getLastBinancePrice(): Promise<ExchangeRateResponseDto | null> {
    return this.getOrSetPrice('BINANCE');
  }

  async getLatestPrices(): Promise<LatestPricesResponseDto> {
    const [bcv, binance] = await Promise.all([
      this.getLastBCVPrice(),
      this.getLastBinancePrice(),
    ]);

    return plainToInstance(
      LatestPricesResponseDto,
      { bcv, binance },
      { excludeExtraneousValues: true },
    );
  }
}
