import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { AlramModule } from './alram/alram.module';

@Module({
  imports: [UserModule, AuthModule, ChatModule, GameModule, AlramModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
