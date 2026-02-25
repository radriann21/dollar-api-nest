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

      return cleanPrice;
    } catch (error) {
      this.logger.error('Failed to get data', error);
      throw new InternalServerErrorException('Failed to get data');
    }
  }

  // TODO: MEJORAR CALCULO DE PROMEDIO
  async scrapeBinance(url: string): Promise<BinancePriceData> {
    try {
      const response = await this.axiosClient.post<BinanceP2PResponse>(url, {
        asset: 'USDT',
        fiat: 'VES',
        merchantCheck: true,
        page: 1,
        rows: 10,
        payTypes: ['PagoMovil'],
        publisherType: null,
        tradeType: 'BUY',
      });

      const { data: responseData } = response;

      if (
        !responseData ||
        !responseData.data ||
        !Array.isArray(responseData.data) ||
        responseData.data.length === 0
      ) {
        throw new NotFoundException('Binance P2P data not found');
      }

      const offers = responseData.data.map((offer) => ({
        price: parseFloat(offer.adv.price),
        available: parseFloat(offer.adv.surplusAmount),
        seller: offer.advertiser.nickName,
      }));

      const prices = offers.map((offer) => offer.price);
      const currentPrice = prices[0];
      const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const highestPrice = Math.max(...prices);
      const lowestPrice = Math.min(...prices);

      const priceChange = currentPrice - lowestPrice;
      const priceChangePercent = parseFloat(
        ((priceChange / lowestPrice) * 100).toFixed(2),
      );

      return {
        currentPrice,
        averagePrice: parseFloat(averagePrice.toFixed(2)),
        highestPrice,
        lowestPrice,
        priceChange: parseFloat(priceChange.toFixed(2)),
        priceChangePercent,
        totalOffers: responseData.total,
        timestamp: new Date().toISOString(),
        offers,
      };
    } catch (error) {
      this.logger.error('Failed to get Binance P2P data', error);
      throw new InternalServerErrorException('Failed to get Binance P2P data');
    }
  }
}
