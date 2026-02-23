import { ApiProperty } from '@nestjs/swagger';

export class ExchangeRateResponseDto {
  @ApiProperty({
    description: 'ID único de la tasa de cambio',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Precio del dólar en bolívares',
    example: '45.2500',
    type: 'string',
  })
  price: string;

  @ApiProperty({
    description: 'ID de la fuente de datos',
    example: 1,
  })
  sourceId: number;

  @ApiProperty({
    description: 'Tendencia del precio',
    example: 'UP',
    enum: ['UP', 'DOWN', 'STABLE'],
  })
  trend: string;

  @ApiProperty({
    description: 'Variación porcentual del precio',
    example: 2.5,
  })
  variation: number;

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-02-23T17:35:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-02-23T17:35:00.000Z',
  })
  updatedAt: Date;
}
