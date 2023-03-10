import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameController } from './game.controller';
import { GameService } from './game.service';

@Module({
  providers: [GameGateway, GameService],
  controllers: [GameController]
})
export class GameModule {}
