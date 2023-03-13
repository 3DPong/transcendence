import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/app/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(app.get(AppConfigService).port);
  app.useGlobalPipes(new ValidationPipe());
}
bootstrap();
