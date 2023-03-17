import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/app/config.service';
import { HttpExceptionFilter } from './common/filters/http/httpException.filter';
import { LoggerMiddleware } from './common/logger/middleware/logger.middleware';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GameSocketIoAdapter } from './models/game/socket/game.socket.adapter';
async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new GameSocketIoAdapter);
  app.useStaticAssets('./src/models/game/');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.use(LoggerMiddleware);
  await app.listen(app.get(AppConfigService).port);
}
bootstrap();
