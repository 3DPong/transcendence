import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Socket } from 'socket.io'
import { GameManager} from '../../simul/GameManager';
import { GamePlayer } from '../../simul/GamePlayer';
import { MATCH_SCORE } from '../../enum/GameEnv';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from '../../entities';
import { Repository } from 'typeorm';
import { MatchJoinData, MatchResultData, OnSceneData, RenderData, ScoreData } from '../../gameData';
import { Server} from 'socket.io'
import { GameDataMaker } from './game.data.maker';
import { GameSimulator } from '../../simul/GameSimulator';
@Injectable()
export class GameService {
  constructor (
    private gameDataMaker : GameDataMaker,
    @InjectRepository(Match) 
    private matchRepository : Repository<Match>,
  ) {}

  public socketJoinRoom(client : Socket, roomId: string){
    client.join(roomId);
    client.data.gameId = roomId;
  }

  public socketLeaveRoom(client : Socket, roomId: string){
    client.leave(roomId);
    client.data.gameId = undefined;
  }

  public mathFind(
    gameRooms : Map<string, GameManager>, 
    matchJoinData : MatchJoinData
  ) : GameManager {
    for (const manager of gameRooms.values()){
      if (
        manager.gameType === matchJoinData.gameType &&
        manager.gameRoomType === matchJoinData.roomType &&
        manager.playerCount === 1
      ) {
        return manager;
      }
    }
    return undefined;
  }

  public async gameEndToClient(
    gameManager: GameManager,
    server : Server
  ){
    const matchResultData : MatchResultData = this.gameDataMaker.makeMatchResultData(gameManager);
    server.to(gameManager.gameId).emit('matchEnd', matchResultData);
  }

  public matchGiveUp(gameManager : GameManager, sid : string){
    const loser : GamePlayer = gameManager.player1.sid === sid ? gameManager.player1 : gameManager.player2;
    const winner : GamePlayer = gameManager.player1.sid !== sid ? gameManager.player1 : gameManager.player2; 
    winner.socore = MATCH_SCORE;
    loser.socore = 0;
  }

  public gamePreheat(gameManager : GameManager, server : Server){
    gameManager.simulator = new GameSimulator(gameManager.player1, gameManager.player2, gameManager.gameType);
    gameManager.renderDatas = this.initRenderDatas(gameManager);
    gameManager.scoreData = new ScoreData();

    const player1sid : string = gameManager.player1.sid;
    const player2sid : string = gameManager.player2.sid;
    const onSceneData1 : OnSceneData = this.gameDataMaker.makeOnSceneData(gameManager, player1sid);
    const onSceneData2 : OnSceneData = this.gameDataMaker.makeOnSceneData(gameManager, player2sid);

    server.to(player1sid).emit('onSceneReady', onSceneData1);
    server.to(player2sid).emit('onSceneReady', onSceneData2);
  }

  public initRenderDatas(gameManager : GameManager) : RenderData[] {
    return this.gameDataMaker.makeRenderDatas(gameManager);
  }
  
  async createMatch(gameManager : GameManager){
    try {
      const newMatch = new Match();
      newMatch.game_type = gameManager.gameType;
      newMatch.match_type = gameManager.gameRoomType;
      newMatch.left_score = gameManager.player1.socore;
      newMatch.right_score = gameManager.player2.socore;
      newMatch.left_player = gameManager.player1.dbId;
      newMatch.right_player = gameManager.player2.dbId;
      await this.matchRepository.save(newMatch);
    } catch (error) {
      throw new InternalServerErrorException('DataBase save Error');
    }
  }
}
