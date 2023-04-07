import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Socket } from 'socket.io'
import { GameManager} from '../../simul/GameManager';
import { GamePlayer } from '../../simul/GamePlayer';
import { MATCH_SCORE } from '../../enum/GameEnv';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from '../../entities';
import { Repository } from 'typeorm';
import { MatchJoinData, MatchResultData, MatchStartData, RenderData } from '../../gameData';
import { Server} from 'socket.io'
import { GameDataMaker } from './game.data.maker';
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

  public async gameEnd(
    gameRooms : Map<string, GameManager>,
    gameManager: GameManager,
    server : Server
  ){
    //todo : 클라이언트 한테 알려주기
    await this.createMatch(gameManager);
    const matchResultData : MatchResultData = this.gameDataMaker.makeMatchResultData(gameManager);
    server.to(gameManager.gameId).emit('matchEnd', matchResultData);
    gameRooms.delete(gameManager.gameId);
  }

  public matchGiveUp(gameManager : GameManager, sid : string){
    const loser : GamePlayer = gameManager.player1.sid === sid ? gameManager.player1 : gameManager.player2;
    const winner : GamePlayer = gameManager.player1.sid !== sid ? gameManager.player1 : gameManager.player2; 
    winner.socore = MATCH_SCORE;
    loser.socore = 0;
  }

  public gameStart(gameManager : GameManager, server : Server){
    const player1sid : string = gameManager.player1.sid;
    const player2sid : string = gameManager.player2.sid;
    const matchStartData1 : MatchStartData = this.gameDataMaker.makeMatchStartData(gameManager, player1sid);
    const matchStartData2 : MatchStartData = this.gameDataMaker.makeMatchStartData(gameManager, player2sid);

    server.to(player1sid).emit('start', matchStartData1);
    server.to(player2sid).emit('start', matchStartData2);
  }

  public initRenderDatas(gameManager : GameManager) : RenderData[] {
    return this.gameDataMaker.makeRenderDatas(gameManager);
  }
  
  async createMatch(gameManager : GameManager){
    const newMatch = new Match();
    newMatch.game_type = gameManager.gameType;
    newMatch.match_type = gameManager.gameRoomType;
    newMatch.left_score = gameManager.player1.socore;
    newMatch.right_score = gameManager.player2.socore;
    newMatch.left_player = gameManager.player1.dbId;
    newMatch.right_player = gameManager.player2.dbId;
    try {
      this.matchRepository.save(newMatch);
    } catch (error) {
      throw new InternalServerErrorException('DataBase save Error');
    }
  }
}
