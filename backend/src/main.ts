import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  console.log('Starting application bootstrap...');

  try {
    const app = await NestFactory.create(AppModule);
    console.log('Nest application created.');

    // Increase body size limit for large Mandalart data
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    // Configure CORS for production
    const allowedOriginsStr = process.env.CORS_ORIGINS || '';

    console.log('Configuring CORS with custom origins or default fallbacks');

    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        // Allow any localhost, any 127.0.0.1, or any github.dev/app.github.dev (Codespaces) URLs
        if (
          origin.includes('localhost') ||
          origin.includes('127.0.0.1') ||
          origin.includes('github.dev') ||
          (allowedOriginsStr && allowedOriginsStr.includes(origin))
        ) {
          callback(null, true);
        } else {
          console.log('CORS blocked origin:', origin);
          callback(null, false);
        }
      },
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: false, // DISABLED to prevent data stripping
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    const port = process.env.PORT || 3000;
    console.log(`Attempting to listen on port ${port}...`);

    await app.listen(port, '0.0.0.0');
    console.log(`Application is running on: http://0.0.0.0:${port}`);
  } catch (error) {
    console.error('Fatal error during application bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
