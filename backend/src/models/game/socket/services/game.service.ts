import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io'
import { GameModEnum,GameRoomTypeEnum } from '../../simul/enum/GameEnum';
import { v4 as uuidv4} from 'uuid';
import { GameManager} from '../../simul/GameManager';
import { GamePlayer } from '../../simul/GamePlayer';
import { MatchDto } from '../../game_dto/createMatch.dto';
import { MATCH_SCORE } from '../../simul/enum/GameEnv';
@Injectable()
export class GameService {

  public createGamePlayer(id : string) : GamePlayer {
    const player : GamePlayer = new GamePlayer(id);
    return player;
  }

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
      if (true
        /*manager.playerCount === 0 &&
        manager.gameMod == dto.gameMod &&
        manager.gameRoomType == dto.gameRoomType// random    */  
      ) {
        return manager;
      }
    }
    return undefined;
  }

  public async gameEnd(
    gameRooms : Map<string, GameManager>,
    gameManager: GameManager
  ){
    //db작업 및 클라이언트 한테 알려주기?
    //gameRooms.delete(gameManager.gameId);
    gameRooms.delete(gameManager.gameId);
  }

  public matchGiveUp(gameManager : GameManager, sid : string){
    const loser : GamePlayer = gameManager.player1.sid === sid ? gameManager.player1 : gameManager.player2;
    const winner : GamePlayer = gameManager.player1.sid !== sid ? gameManager.player1 : gameManager.player2; 
    winner.socore = MATCH_SCORE;
    loser.socore = 0;
  }
}
