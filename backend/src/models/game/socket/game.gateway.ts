import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { v4 as uuidv4} from 'uuid';
import { GameModEnum, GameRoomTypeEnum } from '../simul/enum/GameEnum';
import { GameRoom } from '../gameRoom';
import { createMatchDto } from '../game_dto/createMatch.dto';
import { Player } from '../player';
import { GameService } from './services';
import * as Box2d from '../Box2D';
import { GameSimulator } from '../simul/GameSimulator';

@WebSocketGateway(4242, {
  namespace : 'game',
  cors : {origin : '*'}, 
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  private gameRooms : GameRoom[] = [];

  constructor(
    private readonly gameService : GameService,
  ){}
  async handleConnection() {
    console.log('socket connet');
  }
  async handleDisconnect() {
    console.log('socket disconnet');
  }

  @SubscribeMessage('broadcast')
  async socketStats(@MessageBody() data: any,) : Promise<any> {
    console.log(data);
    return data;
  }

  //모드 맞는 방 찾아서 매칭하고 없으면 생성  
  @SubscribeMessage('randomMatch')
  match(
    @MessageBody() dto : createMatchDto,
    @ConnectedSocket() client : Socket,
  ) {
    const roomidx : number = this.gameRooms.findIndex(
      (room : GameRoom) => 
        room.gameRoomType === GameRoomTypeEnum.RANDOM &&
        room.gameMod === dto.gameMod &&
        room.players.length === 1
      );
    const player : Player = this.gameService.createGamePlayer(client.id);
    if (roomidx === -1){
      const createdRoom = this.gameService.createRandomMatchRoom(dto.gameMod);
      
      createdRoom.players.push(player);
      this.gameRooms.push(createdRoom);
      this.gameService.socketJoinRoom(client, createdRoom.id);
      this.server.to(createdRoom.id).emit('gameCreate', createdRoom);
    }
    else {
      const room : GameRoom = this.gameRooms[roomidx];

      this.gameService.socketJoinRoom(client, room.id);
      this.gameRooms[roomidx].players.push(player);
      this.server.to(room.id).emit('gameStart', room);
      //game start
    }
  }
  //game 시작전 나가기 누르면 매칭시스템에서 탈출
  @SubscribeMessage('exit')
  matchExit(
    @ConnectedSocket() client : Socket,
  ) {
    const roomidx : number = this.gameRooms.findIndex(
      (room : GameRoom) => 
        room.players.length === 1 &&
        room.players[0].sid === client.id
      );
      if (roomidx){
        this.server.emit('gameExit', 'player is not in gameRoom');
        return;
      }
      this.gameService.socketLeaveRoom(client, this.gameRooms[roomidx].id);
      this.server.emit('gameExit', this.gameRooms[roomidx]);
      this.gameRooms.splice(roomidx,1);
  }

  @SubscribeMessage('makeSimul')
  makeSimul(
    @ConnectedSocket() client : Socket
  ) {
      const gameSimulator : GameSimulator = new GameSimulator();
      console.log("simul start");
      gameSimulator.step();
  }
/*
  @SubscribeMessage('inChatMatch')
  match(
    @MessageBody() dto : createMatchDto,
    @ConnectedSocket() client : Socket,
  ) {

  }*/
}
