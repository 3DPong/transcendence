import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { colorist } from './common/middlewares/logger/utils';
import { RedisIoAdapter } from './providers/redis/RedisIO.adapter';
import { JwtPayloadInterface } from './common/interfaces/JwtUser.interface';
import * as cookieParser from 'cookie-parser';
import { AppConfigService } from './config/app/config.service';
import { LoggerMiddleware } from './common/middlewares/logger/middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig = app.get(AppConfigService);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  app.use(cookieParser());

  // app prefix as api
  app.setGlobalPrefix('api');
  await app.listen(appConfig.port);
  startLogging();
}
bootstrap();

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends JwtPayloadInterface {}
  }
}

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
