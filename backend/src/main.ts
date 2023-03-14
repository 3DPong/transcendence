import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/app/config.service';
import { HttpExceptionFilter } from './common/filters/http/httpException.filter';
import { LoggerMiddleware } from './common/logger/middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.use(LoggerMiddleware);
  await app.listen(app.get(AppConfigService).port);
}
bootstrap();
