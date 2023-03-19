import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './models/user/api';
import { AuthModule } from './auth/api';
import { ChatModule } from './models/chat/api';
import { MatchModule } from './models/game/api';
import { AlarmModule } from './models/alarm/socket';
import { PostgresDatabaseProviderModule } from './providers/database/postgres/provider.module';
import { PostgresConfigModule } from './config/database/postgres/config.module';
import { AppConfigModule } from './config/app/config.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http/httpException.filter';
import { SessionConfigModule } from './config/session/config.module';
import { FtConfigModule } from './config/ft/config.module';
import { RedisConfigModule } from './config/redis/config.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ChatModule,
    MatchModule,
    AlarmModule,
    PostgresConfigModule,
    PostgresDatabaseProviderModule,
    AppConfigModule,
    SessionConfigModule,
    FtConfigModule,
    RedisConfigModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
