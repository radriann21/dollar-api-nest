import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { GapResponseDto } from './dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('gap')
  @ApiOperation({
    summary: 'Obtener brecha cambiaria actual',
    description:
      'Calcula y retorna la brecha porcentual entre el precio del dólar en Binance y el BCV. ',
  })
  @ApiOkResponse({
    description: 'Brecha cambiaria calculada exitosamente',
    type: GapResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'No se encontraron datos suficientes para calcular la brecha',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
  })
  getActualGap() {
    return this.analyticsService.getActualGap();
  }
}
