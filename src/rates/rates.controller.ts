import { Controller, Get } from '@nestjs/common';
import { RatesService } from './rates.service';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('sources')
  getSources() {
    return this.ratesService.getSources();
  }

  @Get('last-bcv-price')
  getLastBCVPrice() {
    return this.ratesService.getLastBCVPrice();
  }

  @Get('last-binance-price')
  getLastBinancePrice() {
    return this.ratesService.getLastBinancePrice();
  }

  @Get('latest-prices')
  getLatestPrices() {
    return this.ratesService.getLatestPrices();
  }
}
