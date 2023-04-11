import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import * as session from 'express-session';
import RedisStoreModule from 'connect-redis';
import { RedisConfigService } from '../../../config/redis/config.service';
import { SessionConfigService } from '../../../config/session/config.service';
import { Redis } from 'ioredis';
import { UserStatusEnum } from '../../enums';
import { TokenStatusEnum } from '../../enums/tokenStatusEnum';

declare module 'express-session' {
  interface SessionData {
    user_id?: number;
    userStatus?: UserStatusEnum;
    email?: string;
    sessionStatus: TokenStatusEnum;
    otpSecret: string;
  }
}

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(
    private readonly redisConfigService: RedisConfigService,
    private readonly sessionConfigService: SessionConfigService
  ) {}

  configureMiddleware() {
    const redisClient = new Redis({
      port: this.redisConfigService.port,
      host: this.redisConfigService.host,
      db: this.redisConfigService.sessionDB,
      password: this.redisConfigService.password,
      keyPrefix: 'session:',
    });

    return session({
      // @ts-ignore
      store: new RedisStoreModule({ client: redisClient }),
      secret: this.sessionConfigService.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: false,
        sameSite: 'lax',
        // secure: true, // https 아니라서 사용 못함.
      },
    });
  }

  use(req: Request, res: Response, next: any) {
    const configuredMiddleware = this.configureMiddleware();
    configuredMiddleware(req, res, next);
  }
}
