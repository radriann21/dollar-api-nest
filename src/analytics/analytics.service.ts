import {
  BadRequestException,
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { plainToInstance } from 'class-transformer';
import {
  GapResponseDto,
  WeightedAverageResponseDto,
  MonthlyStatsResponseDto,
  WeeklyStatsResponseDto,
  WeekHistoryResponseDto,
} from './dto';
import { ExchangeRateResponseDto } from 'src/rates/dto';
import { DEFAULT_TTL } from 'src/utils/constants';
import { Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getActualGap(): Promise<GapResponseDto> {
    const cacheKey = 'actual-gap';

    const cached = await this.cacheManager.get<GapResponseDto>(cacheKey);
    if (cached) return cached;

    try {
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
            {
              ...latestBCVPrice,
              price: String(latestBCVPrice.price),
            },
            { excludeExtraneousValues: true },
          ),
          latestBinancePrice: plainToInstance(
            ExchangeRateResponseDto,
            {
              ...latestBinancePrice,
              price: String(latestBinancePrice.price),
            },
            { excludeExtraneousValues: true },
          ),
        },
        { excludeExtraneousValues: true },
      );

      await this.cacheManager.set(cacheKey, fullGapData, DEFAULT_TTL);

      return fullGapData;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Ocurrio un error', error);
      throw new InternalServerErrorException('Error al obtener la brecha');
    }
  }

  async getWeightedAverageDollar(): Promise<WeightedAverageResponseDto> {
    const cacheKey = 'weighted-average-dollar';

    const cached =
      await this.cacheManager.get<WeightedAverageResponseDto>(cacheKey);
    if (cached) return cached;

    try {
      const sources = await this.prisma.sources.findMany({
        where: { isActive: true },
      });

      let totalWeight = 0;
      let weigthedSum = 0;

      sources.forEach((source) => {
        const price = Number(source.lastPrice) || 0;
        const weight = Number(source.weight) || 0;

        if (price > 0) {
          weigthedSum += price * weight;
          totalWeight += source.weight;
        }
      });

      const weightedAverage = totalWeight > 0 ? weigthedSum / totalWeight : 0;

      const response = plainToInstance(
        WeightedAverageResponseDto,
        { weightedAverage },
        { excludeExtraneousValues: true },
      );

      await this.cacheManager.set(cacheKey, response, DEFAULT_TTL);
      return response;
    } catch (error) {
      this.logger.error('Ocurrio un error', error);
      throw new InternalServerErrorException(
        'Error al obtener promedio ponderado',
      );
    }
  }

  async getWeekHistoryData(): Promise<WeekHistoryResponseDto> {
    const cacheKey = 'week-history-data';

    const cached =
      await this.cacheManager.get<WeekHistoryResponseDto>(cacheKey);
    if (cached) return cached;

    try {
      const weekHistoryData = await this.prisma.exchangeRate.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          source: true,
        },
      });

      const transformedData = weekHistoryData.map((rate) =>
        plainToInstance(
          ExchangeRateResponseDto,
          {
            ...rate,
            price: String(rate.price),
          },
          {
            excludeExtraneousValues: true,
          },
        ),
      );
      const response = plainToInstance(
        WeekHistoryResponseDto,
        { data: transformedData },
        { excludeExtraneousValues: true },
      );

      await this.cacheManager.set(cacheKey, response, DEFAULT_TTL);
      return response;
    } catch (error) {
      this.logger.error('Ocurrio un error', error);
      throw new InternalServerErrorException(
        'Error al obtener datos de la semana',
      );
    }
  }

  async monthlyStats(): Promise<MonthlyStatsResponseDto> {
    const cacheKey = 'monthly-stats';

    try {
      const cached =
        await this.cacheManager.get<MonthlyStatsResponseDto>(cacheKey);
      if (cached) {
        this.logger.debug('Retornando datos mensuales desde cache');
        return cached;
      }

      const data = await this.getDataBySource(30);

      const response = { data };

      await this.cacheManager.set(cacheKey, response, DEFAULT_TTL);

      return response;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Error al obtener datos mensuales', error);
      throw new InternalServerErrorException(
        'Error al obtener datos mensuales',
      );
    }
  }

  async weeklyStats(): Promise<WeeklyStatsResponseDto> {
    const cacheKey = 'weekly-stats';

    try {
      const cached =
        await this.cacheManager.get<WeeklyStatsResponseDto>(cacheKey);
      if (cached) {
        this.logger.debug('Retornando datos semanales desde cache');
        return cached;
      }

      const data = await this.getDataBySource(7);

      const response = { data };

      await this.cacheManager.set(cacheKey, response, DEFAULT_TTL);

      return response;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      this.logger.error('Error al obtener datos semanales', error);
      throw new InternalServerErrorException(
        'Error al obtener datos semanales',
      );
    }
  }

  private async getDataBySource(daysAgo: number) {
    try {
      const dateFilter = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      const sources = await this.prisma.sources.findMany({
        where: { isActive: true },
        include: {
          exchangeRates: {
            where: {
              createdAt: { gte: dateFilter },
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });

      const result = sources.map((source) => ({
        source: source.name,
        data: source.exchangeRates.map((rate) => ({
          price: rate.price.toString(),
          createdAt: rate.createdAt,
          trend: rate.trend,
          variation: rate.variation,
        })),
      }));

      return result.sort((a, b) => a.source.localeCompare(b.source));
    } catch (error) {
      this.logger.error('Error al obtener datos por fuente', error);
      throw new InternalServerErrorException('Error al procesar datos');
    }
  }
}
