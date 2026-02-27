import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ScrapperService } from '../scrapper/scrapper.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly scrapperService: ScrapperService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  onApplicationBootstrap() {
    this.logger.log('TasksService initialized');
  }

  @Cron(CronExpression.EVERY_DAY_AT_5PM)
  async getBCVPrice() {
    this.logger.log('Getting price');

    const price = await this.scrapperService.scrapeWebsite(
      this.configService.get<string>('WEBSITE_URL')!,
    );

    await this.savePrice('BCV', Number(price));
    await this.cacheManager.del('latestPrice:BCV');
    this.logger.log(`Price: ${price}`);
  }

  @Cron(CronExpression.EVERY_5_HOURS)
  async getBinancePrice() {
    this.logger.log('Getting binance price');
    const priceData = await this.scrapperService.scrapeBinance(
      this.configService.get<string>('API_URL')!,
    );
    await this.savePrice('BINANCE', priceData.currentPrice);
    await this.cacheManager.del('latestPrice:BINANCE');
    this.logger.log(`Price: ${JSON.stringify(priceData, null, 2)}`);
  }

  // Helper method to save price to database (calculate trend and variation)
  private async savePrice(sourceName: string, price: number) {
    const source = await this.prisma.sources.findUnique({
      where: {
        name: sourceName,
      },
    });

    if (!source) {
      this.logger.warn(`Source ${sourceName} not found`);
      return;
    }

    const lastEntry = await this.prisma.exchangeRate.findFirst({
      where: {
        sourceId: source.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
    let variation = 0;

    if (lastEntry) {
      const lastPrice = Number(lastEntry.price);
      variation = price - lastPrice;
      if (variation > 0) {
        trend = 'UP';
      } else if (variation < 0) {
        trend = 'DOWN';
      } else {
        trend = 'STABLE';
      }
    }

    return this.prisma.exchangeRate.create({
      data: {
        sourceId: source.id,
        price,
        trend,
        variation,
      },
    });
  }
}
