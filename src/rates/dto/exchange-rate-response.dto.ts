import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ExchangeRateResponseDto {
  @ApiProperty({
    description: 'ID único de la tasa de cambio',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Precio del dólar en bolívares',
    example: '45.2500',
    type: 'string',
  })
  @Expose()
  @Transform(({ value }) => {
    if (typeof value === 'object' && value !== null && 'toString' in value) {
      return String(value);
    }
    return String(value);
  })
  price: string;

  @ApiProperty({
    description: 'ID de la fuente de datos',
    example: 1,
  })
  @Expose()
  sourceId: number;

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

  @ApiProperty({
    description: 'Fecha de creación del registro',
    example: '2024-02-23T17:35:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-02-23T17:35:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
