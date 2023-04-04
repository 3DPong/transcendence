import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './services';

@Module({
  providers : [
    GameGateway,
    GameService,
  ],
})
export class GameModule {}
