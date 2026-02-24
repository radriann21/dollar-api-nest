/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET',
  });

  const config = new DocumentBuilder()
    .setTitle('The Dollar API')
    .setDescription(
      'API REST para consultar tasas de cambio del dólar en Venezuela. ' +
        'Proporciona datos actualizados de múltiples fuentes como BCV y Binance. ' +
        'Los datos se cachean por 1 hora para optimizar el rendimiento.',
    )
    .setVersion('1.0')
    .addTag('rates', 'Endpoints para consultar tasas de cambio')
    .addTag('analytics', 'Endpoints para análisis y métricas cambiarias')
    .setContact(
      'API Support',
      'https://github.com/radriann21/dollar-api-nest',
      '',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  app.use(
    '/api',
    apiReference({
      content: documentFactory,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
