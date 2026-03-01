import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PriceDataItemDto } from './price-data-item.dto';

export class SourceDataItemDto {
  @ApiProperty({
    description: 'Nombre de la fuente',
    example: 'BCV',
    type: 'string',
  })
  @Expose()
  source: string;

  @ApiProperty({
    description: 'Datos de precios',
    type: [PriceDataItemDto],
    isArray: true,
  })
  @Expose()
  @Type(() => PriceDataItemDto)
  data: PriceDataItemDto[];
}
