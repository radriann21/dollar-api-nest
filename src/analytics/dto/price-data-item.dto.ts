import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PriceDataItemDto {
  @ApiProperty({
    description: 'Precio del dólar',
    example: '45.2500',
    type: 'string',
  })
  @Expose()
  price: string;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-02-23T17:35:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Tendencia del precio',
    example: 'UP',
    enum: ['UP', 'DOWN', 'STABLE'],
  })
  @Expose()
  trend: string;

  @ApiProperty({
    description: 'Variación porcentual del precio',
    example: 2.5,
  })
  @Expose()
  variation: number;
}
