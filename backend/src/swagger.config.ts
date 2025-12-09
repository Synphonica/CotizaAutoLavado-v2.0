import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Configures Swagger/OpenAPI documentation for the API
 */
export function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle('Alto Carwash API')
        .setDescription(
            `
# Alto Carwash API Documentation

Complete REST API for the Alto Carwash platform - car wash service search, comparison, and booking system.

## Features

- 🔍 **Search & Discovery**: Find car wash providers by location, services, and price
- 📊 **Comparison**: Compare up to 3 providers side-by-side
- 📅 **Booking System**: Real-time booking management with confirmations
- ⭐ **Reviews**: User ratings and feedback system
- 🤖 **AI Assistant**: Personalized recommendations powered by OpenAI
- 📱 **Mobile Optimized**: Full responsive design

## Authentication

This API uses **Clerk** for authentication. Most endpoints require a valid JWT token.

### How to authenticate:

1. **Get your API token** from Clerk
2. **Add to headers**: \`Authorization: Bearer YOUR_TOKEN\`

## Rate Limiting

- **Authenticated users**: 100 requests per minute
- **Anonymous users**: 20 requests per minute

## Error Handling

All errors follow this format:

\`\`\`json
{
  "statusCode": 400,
  "message": "Descriptive error message",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
\`\`\`

## Support

- **Email**: dev@altocarwash.cl
- **GitHub**: https://github.com/Synphonica/alto-carwash
- **Docs**: https://docs.altocarwash.cl
      `.trim(),
        )
        .setVersion('1.0.0')
        .setContact(
            'Alto Carwash Team',
            'https://altocarwash.cl',
            'dev@altocarwash.cl',
        )
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addServer('http://localhost:3000', 'Local Development')
        .addServer('https://api.altocarwash.cl', 'Production')
        .addServer('https://staging-api.altocarwash.cl', 'Staging')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                description: 'Enter your Clerk JWT token',
                in: 'header',
            },
            'JWT',
        )
        .addTag('Authentication', 'User authentication and authorization endpoints')
        .addTag('Search', 'Car wash provider search and filtering')
        .addTag('Providers', 'Car wash provider management')
        .addTag('Services', 'Service offerings and pricing')
        .addTag('Bookings', 'Booking creation and management')
        .addTag('Reviews', 'User reviews and ratings')
        .addTag('Comparison', 'Provider comparison features')
        .addTag('Favorites', 'User favorite providers')
        .addTag('AI Assistant', 'AI-powered recommendations and chat')
        .addTag('Maps', 'Google Maps integration')
        .addTag('Analytics', 'Platform analytics and statistics')
        .addTag('Health', 'Service health checks')
        .build();

    const document = SwaggerModule.createDocument(app, config, {
        operationIdFactory: (controllerKey: string, methodKey: string) =>
            methodKey,
        deepScanRoutes: true,
    });

    SwaggerModule.setup('api/docs', app, document, {
        customSiteTitle: 'Alto Carwash API Docs',
        customfavIcon: 'https://altocarwash.cl/favicon.ico',
        customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0; }
      .swagger-ui .scheme-container { padding: 20px 0; }
    `,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
            tryItOutEnabled: true,
            docExpansion: 'list',
            defaultModelsExpandDepth: 2,
            defaultModelExpandDepth: 2,
        },
        jsonDocumentUrl: '/api/docs-json', // OpenAPI JSON available at this endpoint
    });
}
