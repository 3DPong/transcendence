import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app/config.service';
import { UserStatusEnum } from './common/enums';
import * as process from 'process';
import { colorist } from './common/logger/utils';
import { GameSocketIoAdapter } from './models/game/socket/game.socket.adapter';
import { SessionStatusEnum } from './common/enums/sessionStatus.enum';
import { RedisIoAdapter } from './providers/redis/RedisIO.adapter';

declare module 'express-session' {
  interface SessionData {
    user_id?: number;
    userStatus?: UserStatusEnum;
    email?: string;
    sessionStatus: SessionStatusEnum;
    otpSecret: string;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(AppConfigService);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(appConfig.port);
  startLogging();
}
bootstrap();

// for logging
const startLogging = () => {
  const MODE = process.env.NODE_ENV;
  let STR;
  switch (MODE) {
    case 'prod': {
      STR = 'PRODUCTION';
      break;
    }
    case 'dev': {
      STR = 'DEVELOPMENT';
      break;
    }
    default: {
      STR = 'UNKNOWN';
    }
  }
  console.log(colorist('RUNNING', 'ON', STR));
  console.log(colorist('LISTEN', 'ON', `${process.env.APP_HOST}:${process.env.APP_PORT}`));
};
