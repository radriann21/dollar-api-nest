import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SourceResponseDto } from './source-response.dto';

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
  price: string;

  @ApiProperty({
    description: 'Objeto de la fuente de datos',
    example: { id: 1, name: 'BCV' },
  })
  @Expose()
  @Type(() => SourceResponseDto)
  source: SourceResponseDto;

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
