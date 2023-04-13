import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { GameManager } from '../simul/GameManager';
import { GameService } from './services';
import { RoomType, GameType } from '../enum/GameEnum';
import { InputData, MatchJoinData, ObserveData } from '../gameData';

@WebSocketGateway({
  namespace : 'game',
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
      //todo:
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
  @SubscribeMessage('matchJoin')
  match(
    @MessageBody() matchJoinData : MatchJoinData,
    @ConnectedSocket() client : Socket,
  ) {
    let gameManager : GameManager = this.gameService.mathFind(this.gameRooms, matchJoinData);
    if (gameManager === undefined){
      gameManager = new GameManager(matchJoinData);
      gameManager.createPlayer(client.id, matchJoinData.userId);
      this.gameService.socketJoinRoom(client, gameManager.gameId);
      this.gameRooms.set(gameManager.gameId, gameManager);
      console.log('gameCreate', gameManager.gameId);
    } else {
      gameManager.createPlayer(client.id, matchJoinData.userId);
      this.gameService.socketJoinRoom(client, gameManager.gameId);
      this.gameService.gamePreheat(gameManager, this.server);
    }
  }

  //game 시작전 나가기 누르면 매칭시스템에서 탈출
  @SubscribeMessage('exit')
  matchExit(
    @ConnectedSocket() client : Socket,
  ) {
    const gameManager : GameManager = this.gameRooms.get(client.data.gameId);
    if (gameManager === undefined || gameManager.player1.sid !== client.id){
      this.server.to(client.id).emit('gameExit', 'player is not in gameRoom');
      return;
    }
    this.gameService.socketLeaveRoom(client, gameManager.gameId);
    this.server.to(client.id).emit('gameExit', 'player is exit gameRoom');
    this.gameRooms.delete(gameManager.gameId);
  }

  @SubscribeMessage('observeExit')
  observerExit(
    @ConnectedSocket() client : Socket,
  ) {
    this.gameService.socketLeaveRoom(client, client.data.gameId);
  }
  //observeExit구현해야함
  @SubscribeMessage('observeJoin')
  observerJoin(
    @MessageBody() observeData : ObserveData,
    @ConnectedSocket() client : Socket,
  ) {
    this.gameService.socketJoinRoom(client, observeData.gameId);
  }

  @SubscribeMessage('keyInput')
  keyInput(
    @MessageBody() inputData : InputData,
    @ConnectedSocket() client : Socket
  ) {
    const gameManager : GameManager = this.gameRooms.get(inputData.gameId);
    if (gameManager.started){
      gameManager.Keyboard(inputData.key, client.id);
    }
  }

  @SubscribeMessage('start')
  matchStart(
    @ConnectedSocket() client : Socket
  ) {
    const gameManager : GameManager = this.gameRooms.get(client.data.gameId);
    if (gameManager && gameManager.playerCount == 2 && gameManager.started == false){
      gameManager.started = true;
      gameManager.gameStart(this.server, this.gameService, this.gameRooms);
    }
  }
}
