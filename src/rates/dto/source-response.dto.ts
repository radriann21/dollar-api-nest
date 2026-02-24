import { ApiProperty } from '@nestjs/swagger';

export class SourceResponseDto {
  @ApiProperty({
    description: 'ID único de la fuente',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre de la fuente de datos',
    example: 'BCV',
    enum: ['BCV', 'BINANCE'],
  })
  name: string;

  @ApiProperty({
    description: 'Indica si la fuente está activa',
    example: true,
  })
  isActive: boolean;
}
