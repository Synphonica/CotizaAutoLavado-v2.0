import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import compression from '@fastify/compress';

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
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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

  // Configurar Swagger
  if (process.env.ENABLE_SWAGGER === 'true') {
    const config = new DocumentBuilder()
      .setTitle('Alto Carwash API')
      .setDescription('API para plataforma agregadora de servicios de lavado automotriz')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Autenticación y autorización')
      .addTag('users', 'Gestión de usuarios')
      .addTag('providers', 'Gestión de proveedores')
      .addTag('services', 'Catálogo de servicios')
      .addTag('reviews', 'Sistema de reseñas')
      .addTag('favorites', 'Sistema de favoritos')
      .addTag('notifications', 'Sistema de notificaciones')
      .addTag('search', 'Sistema de búsqueda')
      .addTag('comparison', 'Comparador de servicios y precios')
      .addTag('maps', 'Servicios de geocodificación y distancias')
      .addTag('ai', 'Inteligencia Artificial y recomendaciones')
      .addTag('analytics', 'Métricas y estadísticas del sistema')
      .addTag('upload', 'Gestión de archivos e imágenes')
      .addTag('email', 'Sistema de notificaciones por email')
      .addTag('health', 'Estado del sistema')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    });
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