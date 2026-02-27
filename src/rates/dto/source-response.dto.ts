import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SourceResponseDto {
  @ApiProperty({
    description: 'ID único de la fuente',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Nombre de la fuente de datos',
    example: 'BCV',
    enum: ['BCV', 'BINANCE'],
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Indica si la fuente está activa',
    example: true,
  })
  @Expose()
  isActive: boolean;
}
