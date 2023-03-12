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
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ChatModule,
    MatchModule,
    AlarmModule,
    ConfigModule.forRoot({
      envFilePath: '.env.dev',
    }),
    PostgresConfigModule,
    PostgresDatabaseProviderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
