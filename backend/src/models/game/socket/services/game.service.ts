import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io'
import { GameModEnum,GameRoomTypeEnum } from '../../simul/enum/GameEnum';
import { v4 as uuidv4} from 'uuid';
import { GameRoom } from '../../gameRoom';
import { Player } from '../../player';
@Injectable()
export class GameService {
  createRandomMatchRoom(
    gameMod : GameModEnum,
  ) : GameRoom {
    const room : GameRoom = new GameRoom();
    room.gameRoomType = GameRoomTypeEnum.RANDOM;
    room.gameMod = gameMod;
    room.id = uuidv4();
    room.players = [];
    return room;
  }

  createGamePlayer(id : string) : Player {
    const player : Player = new Player();
    
    player.sid = id;
    
    return player;
  }

  socketJoinRoom(client : Socket, roomId: string){
    client.join(roomId);
  }

  socketLeaveRoom(client : Socket, roomId: string){
    client.leave(roomId);
  }
}
