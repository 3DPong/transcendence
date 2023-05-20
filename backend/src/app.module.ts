import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './models/user/api';
import { AuthModule } from './auth/api';
import { ChatModule } from './models/chat/api';
import { MatchModule } from './models/game/api';
import { PostgresDatabaseProviderModule } from './providers/database/postgres/provider.module';
import { PostgresConfigModule } from './config/database/postgres/config.module';
import { AppConfigModule } from './config/app/config.module';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http/httpException.filter';
import { SessionConfigModule } from './config/session/config.module';
import { FtConfigModule } from './config/ft/config.module';
import { RedisConfigModule } from './config/redis/config.module';
import { DevModule, EmptyModule } from './models/dev/dev.module';
import { ImageModule } from './models/image/image.module';
import { OtpModule } from './auth/otp/otp.module';
import { OtpConfigModule } from './config/otp/config.module';
import { NotifySocketModule } from './models/notifySocket/socket';
import { RedisStorageProviderModule } from './providers/redis/provider.module';
import { WsExceptionFilter } from './common/filters/socket/wsException.filter';
import { LoggerMiddleware } from './common/middlewares/logger/middleware/logger.middleware';
import { NotifierModule } from './models/notifier/notifier.module';
import { GameModule } from './models/game/socket';
import { EmailConfigModule } from './config/email/config.module';
import { KakaoConfigModule } from './config/kakao/config.module';
import { GoogleConfigModule } from './config/google/config.module';
import { NaverConfigModule } from './config/naver/config.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ChatModule,
    MatchModule,
    NotifySocketModule,
    NotifierModule,
    GameModule,
    PostgresConfigModule,
    PostgresDatabaseProviderModule,
    AppConfigModule,
    SessionConfigModule,
    FtConfigModule,
    KakaoConfigModule,
    GoogleConfigModule,
    EmailConfigModule,
    NaverConfigModule,
    RedisConfigModule,
    OtpConfigModule,
    ImageModule,
    OtpModule,
    RedisStorageProviderModule,
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
    // WsExceptionFilter 를 사용하기 위한 설정
    {
      provide: APP_FILTER,
      useClass: WsExceptionFilter,
    },
    // ValidationPipe 를 사용하기 위한 설정
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
