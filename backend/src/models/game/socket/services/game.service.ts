import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Socket } from 'socket.io'
import { GameManager} from '../../simul/GameManager';
import { GamePlayer } from '../../simul/GamePlayer';
import { MatchDto } from '../../game_dto/createMatch.dto';
import { MATCH_SCORE } from '../../simul/enum/GameEnv';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from '../../entities';
import { DataSource, Repository } from 'typeorm';
@Injectable()
export class GameService {
  constructor (
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
    gameRooms : Map<string, GameManager>, dto : MatchDto
  ) : GameManager {
    for (const manager of gameRooms.values()){
      //test를 위해  default true고정 추후 client socket과 통신할때 수정예정
      if (true) {
        return manager;
      }
    }
    return undefined;
  }

  public async gameEnd(
    gameRooms : Map<string, GameManager>,
    gameManager: GameManager
  ){
    //todo : 클라이언트 한테 알려주기
    await this.createMatch(gameManager);
    gameRooms.delete(gameManager.gameId);
  }

  public matchGiveUp(gameManager : GameManager, sid : string){
    const loser : GamePlayer = gameManager.player1.sid === sid ? gameManager.player1 : gameManager.player2;
    const winner : GamePlayer = gameManager.player1.sid !== sid ? gameManager.player1 : gameManager.player2; 
    winner.socore = MATCH_SCORE;
    loser.socore = 0;
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
