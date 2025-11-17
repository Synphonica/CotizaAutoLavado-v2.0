import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import compression from '@fastify/compress';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { setupSwagger } from './swagger.config';

async function bootstrap() {
  // Crear aplicación con Fastify
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: process.env.NODE_ENV === 'development',
      trustProxy: true,
    })
  );

  // Configurar prefijo global de API
  app.setGlobalPrefix('api');

  // Configurar filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configurar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Configurar CORS
  await app.register(cors, {
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',  // Frontend Next.js
      'http://localhost:4000',  // Backend API
      'http://localhost:19006', // Expo mobile
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Configurar Helmet para seguridad
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'https:'],
        scriptSrc: [`'self'`],
      },
    },
  });

  // Configurar rate limiting
  await app.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_TTL || '60') * 1000,
    errorResponseBuilder: (req, context) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded, try again later',
    }),
  });

  // Configurar compresión
  await app.register(compression, {
    threshold: 1024,
    encodings: ['gzip', 'deflate'],
  });

  // Configurar Swagger / OpenAPI Documentation
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SWAGGER === 'true') {
    setupSwagger(app);
  }

  // Puerto de la aplicación
  const port = process.env.PORT || 4000;

  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Alto Carwash API ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
}

bootstrap().catch((error) => {
  console.error('❌ Error al iniciar la aplicación:', error);
  process.exit(1);
});