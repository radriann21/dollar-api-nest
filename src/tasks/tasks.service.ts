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
    // void this.getBCVPrice();
    // void this.getBinancePrice();
  }

  @Cron(CronExpression.EVERY_6_HOURS)
  async getBCVPrice() {
    this.logger.log('Getting price');

    const price = await this.scrapperService.scrapeWebsite(
      this.configService.get<string>('WEBSITE_URL')!,
    );

    await this.savePrice('BCV', Number(price));
    await this.cacheManager.del('latestPrice:BCV');
    this.logger.log(`Price: ${price}`);
  }

  @Cron(CronExpression.EVERY_4_HOURS)
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
      include: {
        exchangeRates: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!source) {
      this.logger.warn(`Source ${sourceName} not found`);
      return;
    }

    const lastEntry = source.exchangeRates[0];

    if (lastEntry && Number(lastEntry.price) === price) {
      this.logger.log('No change in price');
      return;
    }

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

    return await this.prisma.$transaction(async (tx) => {
      await tx.sources.update({
        where: {
          id: source.id,
        },
        data: {
          lastPrice: price,
        },
      });

      await tx.exchangeRate.create({
        data: {
          price,
          trend,
          variation,
          sourceId: source.id,
        },
      });
    });
  }
}
