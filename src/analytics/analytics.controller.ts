import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import {
  GapResponseDto,
  WeightedAverageResponseDto,
  MonthlyStatsResponseDto,
  WeeklyStatsResponseDto,
  WeekHistoryResponseDto,
} from './dto';

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

  @Get('weighted-average')
  @ApiOperation({
    summary: 'Obtener promedio ponderado del dólar',
    description:
      'Calcula y retorna el promedio ponderado del dólar basado en las fuentes activas.',
  })
  @ApiOkResponse({
    description: 'Promedio ponderado calculado exitosamente',
    type: WeightedAverageResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'No se encontraron datos suficientes para calcular el promedio',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
  })
  getWeightedAverage(): Promise<WeightedAverageResponseDto> {
    return this.analyticsService.getWeightedAverageDollar();
  }

  @Get('monthly-stats')
  @ApiOperation({
    summary: 'Obtener estadísticas mensuales',
    description:
      'Retorna estadísticas mensuales del dólar basado en las fuentes activas.',
  })
  @ApiOkResponse({
    description: 'Estadísticas mensuales calculadas exitosamente',
    type: MonthlyStatsResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'No se encontraron datos suficientes para calcular las estadísticas',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
  })
  monthlyStats(): Promise<MonthlyStatsResponseDto> {
    return this.analyticsService.monthlyStats();
  }

  @Get('weekly-stats')
  @ApiOperation({
    summary: 'Obtener estadísticas semanales',
    description:
      'Retorna estadísticas semanales del dólar agrupadas por fuente.',
  })
  @ApiOkResponse({
    description: 'Estadísticas semanales calculadas exitosamente',
    type: WeeklyStatsResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'No se encontraron datos suficientes para calcular las estadísticas',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
  })
  weeklyStats(): Promise<WeeklyStatsResponseDto> {
    return this.analyticsService.weeklyStats();
  }

  @Get('week-history')
  @ApiOperation({
    summary: 'Obtener historial de la semana',
    description:
      'Retorna el historial de la semana del dólar basado en las fuentes activas.',
  })
  @ApiOkResponse({
    description: 'Historial de la semana calculado exitosamente',
    type: WeekHistoryResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'No se encontraron datos suficientes para calcular el historial',
  })
  @ApiInternalServerErrorResponse({
    description: 'Error interno del servidor',
  })
  weekHistory(): Promise<WeekHistoryResponseDto> {
    return this.analyticsService.getWeekHistoryData();
  }
}
