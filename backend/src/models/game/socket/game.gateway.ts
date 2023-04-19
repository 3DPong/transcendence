import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { GameManager } from '../simul/GameManager';
import { GameService } from './services';
import { RoomType, GameType } from '../enum/GameEnum';
import { InputData, MatchJoinData, ObserveData } from '../gameData';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/common/guards/jwt/jwt.guard';

@WebSocketGateway({namespace : 'game'})
@UseGuards(JwtGuard)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  private server: Server;
  private gameRooms : Map<string, GameManager> = new Map();

  constructor(
    private readonly gameService : GameService,
    private readonly logger : Logger,
  ){}

  async handleConnection(@ConnectedSocket() client : Socket) {
    this.logger.log(`${client.id} is connect game socket`);
  }
  //client가 창을 닫을 때 끊을 것 인지 게임 매칭을 나갈때 닫을 것인지에 따라 구현이 달라질듯
  //client가 게임 참가자인지 옵저버인지 구분해야함
  async handleDisconnect(@ConnectedSocket() client : Socket) {
    //게임매칭을찾는중,게임을진행중
    const gameManager : GameManager = this.gameRooms.get(client.data.gameId);
    if (gameManager?.playerCount === 1) {
      this.gameRooms.delete(client.data.gameId);
      this.logger.log(`${client.id} is disconnect game socket and delete ${gameManager.gameId}`);
    } else if (
      gameManager?.playerCount === 2 && 
      gameManager.simulator.matchInterrupt.isInterrupt === false &&
      this.gameService.isGamePalyer(gameManager, client.id)
    ) {
      gameManager.simulator.matchInterrupt.isInterrupt = true;
      gameManager.simulator.matchInterrupt.sid = client.id;
      this.gameService.matchGiveUp(gameManager, client.id);
      this.logger.log(`${client.id} player disconnect and giveUp game`);
    }
    this.logger.log(`${client.id} is disconnect game socket`);
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
      this.logger.log(`gameCreate ${gameManager.gameId}`);
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
  //observe
  //init data 보내는 부분 추가
  @SubscribeMessage('observeJoin')
  observerJoin(
    @MessageBody() observeData : ObserveData,
    @ConnectedSocket() client : Socket,
  ) {
    const gameManager : GameManager = this.gameRooms.get(observeData.gameId);
    if (gameManager?.started){
      this.gameService.initObserver(gameManager,this.server, client.id);
      this.gameService.socketJoinRoom(client, observeData.gameId);
    }
  }

  @SubscribeMessage('keyInput')
  keyInput(
    @MessageBody() inputData : InputData,
    @ConnectedSocket() client : Socket
  ) {
    const gameManager : GameManager = this.gameRooms.get(inputData.gameId);
    if (gameManager?.started && this.gameService.isGamePalyer(gameManager, client.id) ){
      gameManager.Keyboard(inputData.key, client.id);
    }
  }

  @SubscribeMessage('start')
  matchStart(
    @ConnectedSocket() client : Socket
  ) {
    const gameManager : GameManager = this.gameRooms.get(client.data.gameId);
    if (gameManager?.playerCount == 2 && gameManager.started == false){
      gameManager.started = true;
      gameManager.gameStart(this.server, this.gameService, this.gameRooms);
    }
  }
}
