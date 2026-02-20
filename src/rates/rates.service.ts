import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RatesService {
  private readonly logger = new Logger(RatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSources() {
    return await this.prisma.sources.findMany();
  }

  async getLastBCVPrice() {
    try {
      const lastPrice = await this.prisma.exchangeRate.findFirst({
        where: {
          source: {
            name: 'BCV',
          },
        },
      });
      return lastPrice;
    } catch (error) {
      this.logger.error('Error getting last BCV price', error);
      throw new InternalServerErrorException('Error getting last BCV price');
    }
  }

  async getLastBinancePrice() {
    try {
      const lastPrice = await this.prisma.exchangeRate.findFirst({
        where: {
          source: {
            name: 'BINANCE',
          },
        },
      });
      return lastPrice;
    } catch (error) {
      this.logger.error('Error getting last Binance price', error);
      throw new InternalServerErrorException(
        'Error getting last Binance price',
      );
    }
  }

  async getLatestPrices() {
    try {
      const [bcvPrice, binancePrice] = await Promise.all([
        this.getLastBCVPrice(),
        this.getLastBinancePrice(),
      ]);
      return {
        bcv: bcvPrice,
        binance: binancePrice,
      };
    } catch (error) {
      this.logger.error('Error getting latest prices', error);
      throw new InternalServerErrorException('Error getting latest prices');
    }
  }
}
