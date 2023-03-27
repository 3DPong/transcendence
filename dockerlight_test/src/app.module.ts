import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MatchModule } from './models/game/api';
import { AppConfigModule } from './config/app/config.module';
import { GameModule } from './models/game/socket';

@Module({
  imports: [
    MatchModule,
    GameModule,

    AppConfigModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
