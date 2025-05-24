import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import compression from 'compression';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1) GZIP
  app.use(compression());

  // 2) Validação global
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // 3) CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://iconic-seven.vercel.app',
      'https://iconicxp.netlify.app',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Transaction-Id',
    ],
    credentials: false,
  });

  // 4) Swagger
  const config = new DocumentBuilder()
    .setTitle('ICONIC API')
    .setDescription('Documentação da API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
