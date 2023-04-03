import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './models/user/api';
import { AuthModule } from './auth/api';
import { ChatModule } from './models/chat/api';
import { MatchModule } from './models/game/api';
import { PostgresDatabaseProviderModule } from './providers/database/postgres/provider.module';
import { PostgresConfigModule } from './config/database/postgres/config.module';
import { AppConfigModule } from './config/app/config.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http/httpException.filter';
import { SessionConfigModule } from './config/session/config.module';
import { FtConfigModule } from './config/ft/config.module';
import { RedisConfigModule } from './config/redis/config.module';
import { DevModule, EmptyModule } from './models/dev/dev.module';
import { ImageModule } from './models/image/image.module';
import { OtpModule } from './common/otp/otp.module';
import { OtpConfigModule } from './config/otp/config.module';
import { NotifyModule } from './models/notify/socket/notify.module';
import { RedisIoAdapter } from './providers/redis/RedisIO.adapter';
import { RedisConfigService } from './config/redis/config.service';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ChatModule,
    MatchModule,
    NotifyModule,
    PostgresConfigModule,
    PostgresDatabaseProviderModule,
    AppConfigModule,
    SessionConfigModule,
    FtConfigModule,
    RedisConfigModule,
    OtpConfigModule,
    ImageModule,
    OtpModule,
    process.env.NODE_ENV !== 'prod' ? DevModule : EmptyModule, // 개발용으로 사용하는 PATH 를 PRODUCTION MODE 에서 제외
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // HttpExceptionFilter 를 사용하기 위한 설정
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // RedisIoAdapter 를 사용하기 위한 설정
    {
      provide: RedisIoAdapter,
      useFactory: (redisConfigService: RedisConfigService) => {
        const adapter = new RedisIoAdapter(redisConfigService);
        adapter.connectToRedis();
        return adapter;
      },
      inject: [RedisConfigService],
    },
  ],
})
export class AppModule {}
