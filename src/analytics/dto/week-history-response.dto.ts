import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ExchangeRateResponseDto } from 'src/rates/dto';

export class WeekHistoryResponseDto {
  @ApiProperty({
    description: 'Historial de tasas de cambio de los últimos 7 días',
    type: [ExchangeRateResponseDto],
    isArray: true,
  })
  @Expose()
  @Type(() => ExchangeRateResponseDto)
  data: ExchangeRateResponseDto[];
}
