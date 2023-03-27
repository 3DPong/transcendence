import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app/config.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { GameSocketIoAdapter } from './models/game/socket/game.socket.adapter';


async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useWebSocketAdapter(new GameSocketIoAdapter);
  app.useStaticAssets('./src/models/game/');
  const appConfig = app.get(AppConfigService);

  await app.listen(appConfig.port);
}
bootstrap();

