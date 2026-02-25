import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { RatesService } from './rates.service';
import {
  SourceResponseDto,
  ExchangeRateResponseDto,
  LatestPricesResponseDto,
} from './dto';

@ApiTags('rates')
@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('sources')
  @ApiOperation({
    summary: 'Obtener todas las fuentes',
    description:
      'Retorna la lista de todas las fuentes de datos disponibles (BCV, Binance, etc.)',
  })
  @ApiOkResponse({
    description: 'Lista de fuentes obtenida exitosamente',
    type: [SourceResponseDto],
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
  })
  getSources() {
    return this.ratesService.getSources();
  }

  @Get('last-bcv-price')
  @ApiOperation({
    summary: 'Obtener último precio del BCV',
    description:
      'Retorna la tasa de cambio más reciente del Banco Central de Venezuela.',
  })
  @ApiOkResponse({
    description: 'Último precio del BCV obtenido exitosamente',
    type: ExchangeRateResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Precio no encontrado (null)',
    schema: { type: 'null' },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error al consultar la base de datos',
  })
  getLastBCVPrice() {
    return this.ratesService.getLastBCVPrice();
  }

  @Get('last-binance-price')
  @ApiOperation({
    summary: 'Obtener último precio de Binance',
    description: 'Retorna la tasa de cambio más reciente de Binance.',
  })
  @ApiOkResponse({
    description: 'Último precio de Binance obtenido exitosamente',
    type: ExchangeRateResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Precio no encontrado (null)',
    schema: { type: 'null' },
  })
  @ApiInternalServerErrorResponse({
    description: 'Error al consultar la base de datos',
  })
  getLastBinancePrice() {
    return this.ratesService.getLastBinancePrice();
  }

  @Get('latest-prices')
  @ApiOperation({
    summary: 'Obtener últimos precios de todas las fuentes',
    description:
      'Retorna las tasas de cambio más recientes de BCV y Binance en una sola petición.',
  })
  @ApiOkResponse({
    description: 'Últimos precios obtenidos exitosamente',
    type: LatestPricesResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Error al consultar la base de datos',
  })
  getLatestPrices() {
    return this.ratesService.getLatestPrices();
  }
}
