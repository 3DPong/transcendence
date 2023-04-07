import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../entities';
import { GameGateway } from './game.gateway';
import { GameService } from './services';
import { GameDataMaker } from './services/game.data.maker';

@Module({
  imports :[TypeOrmModule.forFeature([Match])],
  providers : [
    GameGateway,
    GameService,
    GameDataMaker
  ],
})
export class GameModule {}
