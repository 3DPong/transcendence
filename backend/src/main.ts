import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppConfigService } from './config/app/config.service';
import { HttpExceptionFilter } from './common/filters/http/httpException.filter';
import { LoggerMiddleware } from './common/logger/middleware/logger.middleware';
import * as session from 'express-session';
import { SessionConfigService } from './config/session/config.service';
import connectRedis from 'connect-redis';
import { Redis } from 'ioredis';
import { RedisConfigService } from './config/redis/config.service';
import { UserStatusEnum } from './common/enums';

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
  const RedisStore = connectRedis.bind(session);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(new ValidationPipe());
  app.use(LoggerMiddleware);
  app.use(
    session({
      store: new RedisStore({ client: redisClient, prefix: 'ts:' }),
      secret: sessionConfig.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 30000,
        // secure: true, // https 아니라서 사용 못함.
      },
    })
  );
  await app.listen(appConfig.port);
}
bootstrap();
