import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { GameManager } from '../simul/GameManager';
import { MatchDto } from '../game_dto/createMatch.dto';
import { GameService } from './services';
import { GameDto } from '../game_dto/GameDto';

@WebSocketGateway(4242, {
  namespace : 'game',
  cors : {origin : '*'}, 
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;
  private gameRooms : Map<string, GameManager> = new Map();

  constructor(
    private readonly gameService : GameService,
  ){}

  async handleConnection() {
    //socket vaild check
    console.log('socket connet');
  }
  //client가 창을 닫을 때 끊을 것 인지 게임 매칭을 나갈때 닫을 것인지에 따라 구현이 달라질듯
  async handleDisconnect(@ConnectedSocket() client : Socket) {
    //게임매칭을찾는중,게임을진행중
    const gameManager : GameManager = this.gameRooms.get(client.data.gameId);
    if (gameManager === undefined){
      //todo
      console.log('manager undefined check');
    } else if (gameManager.playerCount === 1) {
      console.log('player disconnect and delete gameRoom')
      this.gameRooms.delete(client.data.gameId);
    } else if (
      gameManager.playerCount === 2 && 
      gameManager.simulator.matchInterrupt.isInterrupt === false
    ) {
      gameManager.simulator.matchInterrupt.isInterrupt = true;
      gameManager.simulator.matchInterrupt.sid = client.id;
      this.gameService.matchGiveUp(gameManager, client.id);
      console.log('player disconnect and giveUp game')
    }
    console.log('socket disconnet');
  }

  //모드 맞는 방 찾아서 매칭하고 없으면 생성  
  @SubscribeMessage('Match')
  match(
    @MessageBody() dto : MatchDto,
    @ConnectedSocket() client : Socket,
  ) {
    console.log(dto);
    let gameManager : GameManager = this.gameService.mathFind(this.gameRooms, dto);
    if (gameManager === undefined){
      gameManager = new GameManager(dto);
      gameManager.createPlayer(client.id);
      this.gameService.socketJoinRoom(client, gameManager.gameId);
      this.gameRooms.set(gameManager.gameId, gameManager);
      console.log('gameCreate', gameManager.gameId);
    } else {
      this.gameService.socketJoinRoom(client, gameManager.gameId);
      gameManager.createPlayer(client.id);
      this.server.to(gameManager.gameId).emit('gameStart', gameManager);
      gameManager.gameStart(this.server, this.gameService, this.gameRooms);
      console.log('gameStart');
    }
  }

  //game 시작전 나가기 누르면 매칭시스템에서 탈출
  @SubscribeMessage('exit')
  matchExit(
    @MessageBody() dto : GameDto,
    @ConnectedSocket() client : Socket,
  ) {
    const gameManager : GameManager = this.gameRooms.get(dto.gameId);
    if (gameManager === undefined || gameManager.player1.sid !== client.id){
      this.server.to(client.id).emit('gameExit', 'player is not in gameRoom');
      return;
    }
    this.gameService.socketLeaveRoom(client, gameManager.gameId);
    this.server.to(client.id).emit('gameExit', 'player is exit gameRoom');
    this.gameRooms.delete(gameManager.gameId);
  }
}
