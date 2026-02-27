/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

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
    .setLicense('AGPL-3.0', 'https://opensource.org/licenses/AGPL-3.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            'https://cdn.jsdelivr.net',
          ],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            'https://cdn.jsdelivr.net',
            'https://fonts.googleapis.com',
          ],
          'font-src': [
            "'self'",
            'https://fonts.gstatic.com',
            'https://fonts.scalar.com',
          ],
          'connect-src': [
            "'self'",
            'https://proxy.scalar.com',
            'https://api.scalar.com',
          ],
          'img-src': [
            "'self'",
            'data:',
            'https://scalar.com',
            'https://cdn.jsdelivr.net',
          ],
        },
      },
    }),
  );

  app.use(
    '/api',
    apiReference({
      content: documentFactory,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
