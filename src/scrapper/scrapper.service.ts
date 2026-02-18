import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import https from 'https';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class ScrapperService {
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
    } catch {
      throw new InternalServerErrorException('Failed to get data');
    }
  }
}
