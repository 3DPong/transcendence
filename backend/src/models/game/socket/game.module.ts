import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from '../entities';
import { GameGateway } from './game.gateway';
import { GameService } from './services';

@Module({
  imports :[TypeOrmModule.forFeature([Match])],
  providers : [
    GameGateway,
    GameService,
  ],
})
export class GameModule {}
