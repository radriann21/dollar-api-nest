import {
  Injectable,
  InternalServerErrorException,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RatesService {
  private readonly logger = new Logger(RatesService.name);
  private readonly DEFAULT_TTL = 3600000; // 1 hora en ms

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  // Método privado para evitar repetir lógica de caché
  private async getOrSetPrice(sourceName: string) {
    const cacheKey = `latestPrice:${sourceName.toUpperCase()}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    try {
      const lastPrice = await this.prisma.exchangeRate.findFirst({
        where: { source: { name: sourceName } },
        orderBy: { createdAt: 'desc' },
      });

      if (lastPrice) {
        await this.cacheManager.set(cacheKey, lastPrice, this.DEFAULT_TTL);
      }
      return lastPrice;
    } catch (error) {
      this.logger.error(`Error getting last ${sourceName} price`, error);
      throw new InternalServerErrorException(`Error database: ${sourceName}`);
    }
  }

  async getSources() {
    return await this.prisma.sources.findMany();
  }

  async getLastBCVPrice() {
    return this.getOrSetPrice('BCV');
  }

  async getLastBinancePrice() {
    return this.getOrSetPrice('BINANCE');
  }

  async getLatestPrices() {
    const [bcv, binance] = await Promise.all([
      this.getLastBCVPrice(),
      this.getLastBinancePrice(),
    ]);

    return { bcv, binance };
  }
}
