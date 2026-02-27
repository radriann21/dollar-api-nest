import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ExchangeRateResponseDto } from 'src/rates/dto';

export class GapResponseDto {
  @ApiProperty({
    description: 'Brecha porcentual entre el precio de Binance y el BCV',
    example: '15.25%',
    type: 'string',
  })
  @Expose()
  gap: string;

  @ApiProperty({
    description: 'Último precio registrado del BCV',
    type: ExchangeRateResponseDto,
  })
  @Expose()
  @Type(() => ExchangeRateResponseDto)
  latestBCVPrice: ExchangeRateResponseDto;

  @ApiProperty({
    description: 'Último precio registrado de Binance',
    type: ExchangeRateResponseDto,
  })
  @Expose()
  @Type(() => ExchangeRateResponseDto)
  latestBinancePrice: ExchangeRateResponseDto;
}
