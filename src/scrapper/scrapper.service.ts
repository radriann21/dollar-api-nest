import * as cheerio from 'cheerio';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import https from 'https';
import axios from 'axios';
import {
  BinanceP2PResponse,
  BinancePriceData,
} from './interfaces/scrapper.interfaces';

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);

  private readonly axiosClient = axios.create({
    timeout: 10000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
    }),
  });

  async scrapeWebsite(url: string) {
    try {
      const { data }: { data: string } = await this.axiosClient.get(url);

      if (!data) {
        throw new NotFoundException('Data not found');
      }

      const $ = cheerio.load(data);

      const rawPrice = $('#dolar .centrado strong').text().trim();
      const cleanPrice = parseFloat(rawPrice.replace(',', '.'));

      if (isNaN(cleanPrice)) {
        throw new InternalServerErrorException('Failed to get data');
      }

      return cleanPrice.toFixed(2);
    } catch (error) {
      this.logger.error('Failed to get data', error);
      throw new InternalServerErrorException('Failed to get data');
    }
  }

  async scrapeBinance(url: string): Promise<BinancePriceData> {
    try {
      const response = await this.axiosClient.post<BinanceP2PResponse>(url, {
        asset: 'USDT',
        fiat: 'VES',
        merchantCheck: true,
        page: 1,
        rows: 15,
        payTypes: ['PagoMovil'],
        publisherType: 'merchant',
        tradeType: 'BUY',
      });

      const data = response.data.data;

      if (!data || data.length === 0) {
        throw new NotFoundException('Binance P2P data not found');
      }

      let totalVolume = 0;
      let weightedSum = 0;
      const priceList: number[] = [];

      const offers = data.map((item) => {
        const price = parseFloat(item.adv.price);
        const amount = parseFloat(item.adv.surplusAmount);

        priceList.push(price);

        weightedSum += price * amount;
        totalVolume += amount;

        return {
          price,
          available: amount,
          seller: item.advertiser.nickName,
        };
      });

      // CÁLCULOS MEJORADOS
      const currentPrice = priceList[0];
      const simpleAverage =
        priceList.reduce((a, b) => a + b, 0) / priceList.length;
      const weightedAverage = weightedSum / totalVolume;

      const highestPrice = Math.max(...priceList);
      const lowestPrice = Math.min(...priceList);

      // Variación respecto al promedio (más estable que respecto al mínimo)
      const priceChange = currentPrice - simpleAverage;
      const priceChangePercent = (priceChange / simpleAverage) * 100;

      return {
        currentPrice: Number(currentPrice.toFixed(4)),
        averagePrice: Number(weightedAverage.toFixed(4)),
        highestPrice: Number(highestPrice.toFixed(4)),
        lowestPrice: Number(lowestPrice.toFixed(4)),
        priceChange: Number(priceChange.toFixed(4)),
        priceChangePercent: Number(priceChangePercent.toFixed(2)),
        totalOffers: response.data.total,
        timestamp: new Date().toISOString(),
        offers,
      };
    } catch (error) {
      this.logger.error('Failed to get Binance P2P data', error);
      throw new InternalServerErrorException('Error en el cálculo de Binance');
    }
  }
}
