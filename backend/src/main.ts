import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  // CORS
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
  });

  // Global Prefix
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', 'docs'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filter & Response Transform Interceptor
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger Documentation Setup
  const swaggerEnabled = configService.get<string>('SWAGGER_ENABLED', 'true') === 'true';
  const swaggerPath = configService.get<string>('SWAGGER_PATH', 'docs');

  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('Social Discovery API')
      .setDescription(
        'RESTful & WebSocket API backend for Social Discovery mobile application (matching, discovery, chat, meetups).',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addTag('Health', 'Server and database health endpoints')
      .addTag('Auth', 'Authentication, OTP requests, JWT token lifecycle, and current user')
      .addTag('Users', 'User identity and account management')
      .addTag('Profiles', 'User profile details, bio, avatar, and intent')
      .addTag('Interests', 'Global interests catalog and user-selected vibe tags')
      .addTag('Photos', 'User gallery photos and main avatar management')
      .addTag('Preferences', 'Discovery matching preferences and age/distance filters')
      .addTag('Verification', 'Selfie face liveness and identity verification')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(swaggerPath, app, document);
  }

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  await app.listen(port);
  logger.log(`🚀 Social Discovery Backend is running in [${nodeEnv}] mode on: http://localhost:${port}`);
  logger.log(`🩺 Health check available at: http://localhost:${port}/health`);
  if (swaggerEnabled) {
    logger.log(`📚 Swagger Documentation available at: http://localhost:${port}/${swaggerPath}`);
  }
}

bootstrap();
