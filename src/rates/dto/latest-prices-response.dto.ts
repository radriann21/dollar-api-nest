import { ApiProperty } from '@nestjs/swagger';
import { ExchangeRateResponseDto } from './exchange-rate-response.dto';

export class LatestPricesResponseDto {
  @ApiProperty({
    description: 'Último precio del BCV',
    type: ExchangeRateResponseDto,
    nullable: true,
  })
  bcv: ExchangeRateResponseDto | null;

  @ApiProperty({
    description: 'Último precio de Binance',
    type: ExchangeRateResponseDto,
    nullable: true,
  })
  binance: ExchangeRateResponseDto | null;
}
