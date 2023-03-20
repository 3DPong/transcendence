import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/app/config.service';
import { HttpExceptionFilter } from './common/filters/http/httpException.filter';
import { LoggerMiddleware } from './common/logger/middleware/logger.middleware';
import * as session from 'express-session';
import { SessionConfigService } from './config/session/config.service';
import RedisStore from 'connect-redis';
import { Redis } from 'ioredis';
import { RedisConfigService } from './config/redis/config.service';
import { UserStatusEnum } from './common/enums';
import * as process from 'process';
import { colorist } from './common/logger/utils';

declare module 'express-session' {
  interface SessionData {
    user_id?: number;
    status?: UserStatusEnum;
    email?: string;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(AppConfigService);
  const sessionConfig = app.get(SessionConfigService);
  const redisConfig = app.get(RedisConfigService);
  const redisClient = new Redis({ port: redisConfig.port, host: redisConfig.host });
  // @ts-ignore
  const redisStore = new RedisStore({
    client: redisClient,
    prefix: 'ts:',
  } as any);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.use(LoggerMiddleware);
  app.use(
    session({
      store: redisStore,
      secret: sessionConfig.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        // secure: true, // https 아니라서 사용 못함.
      },
    })
  );

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
