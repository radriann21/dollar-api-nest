import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class WeightedAverageResponseDto {
  @ApiProperty({
    description: 'Promedio ponderado del dólar basado en las fuentes activas',
    example: 45.25,
    type: 'number',
  })
  @Expose()
  weightedAverage: number;
}
