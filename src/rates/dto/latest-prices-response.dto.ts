import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ExchangeRateResponseDto } from './exchange-rate-response.dto';

export class LatestPricesResponseDto {
  @ApiProperty({
    description: 'Último precio del BCV',
    type: ExchangeRateResponseDto,
    nullable: true,
  })
  @Expose()
  @Type(() => ExchangeRateResponseDto)
  bcv: ExchangeRateResponseDto | null;

  @ApiProperty({
    description: 'Último precio de Binance',
    type: ExchangeRateResponseDto,
    nullable: true,
  })
  @Expose()
  @Type(() => ExchangeRateResponseDto)
  binance: ExchangeRateResponseDto | null;
}
