import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SourceDataItemDto } from './source-data-item.dto';

export class WeeklyStatsResponseDto {
  @ApiProperty({
    description: 'Datos semanales agrupados por fuente',
    type: [SourceDataItemDto],
    isArray: true,
  })
  @Expose()
  @Type(() => SourceDataItemDto)
  data: SourceDataItemDto[];
}
