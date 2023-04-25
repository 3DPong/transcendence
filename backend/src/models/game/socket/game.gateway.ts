import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { GameManager } from '../simul/GameManager';
import { GameService } from './services';
import { ChatJoinData, InputData, MatchJoinData, ObserveData } from '../gameData';
import { Logger, UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadInterface } from 'src/common/interfaces/JwtUser.interface';
import { TokenStatusEnum } from 'src/common/enums/tokenStatusEnum';
import { InviteData } from '../gameData/InviteData';
import { SocketException, SocketExceptionFilter } from 'src/common/filters/socket/socket.filter';
@WebSocketGateway({namespace : 'game'})
@UseFilters(new SocketExceptionFilter())
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  private server: Server;
  private gameRooms : Map<string, GameManager> = new Map();
  private logger : Logger;

  constructor(
    private readonly gameService : GameService,
    private readonly jwtService : JwtService,
  ){
    this.logger = new Logger("gameGateway");
  }

  async handleConnection(@ConnectedSocket() client : Socket) {
    try {
      const cookie = client.handshake.headers.cookie;
      const token = cookie.split(';').find((c : string) => c.trim().startsWith('Authentication=')).split('=')[1].trim();
      const decoded : JwtPayloadInterface = this.jwtService.verify(token);
      if (!decoded || !decoded.user_id || decoded.status != TokenStatusEnum.SUCCESS){
        client.disconnect();
        this.logger.log(`${client.id} is disconnect jwt failed`);
      } else {
        client.data.userId = decoded.user_id;
      }
    } catch (error) {
      client.disconnect();
      this.logger.log(`${client.id} is disconnect jwt failed`);
    }
  }

  async handleDisconnect(@ConnectedSocket() client : Socket) {
    //게임매칭을찾는중,게임을진행중
    this.gameService.gameExit(this.gameRooms, client);
    this.logger.log(`${client.id} is disconnect game socket`);
  }

  //모드 맞는 방 찾아서 매칭하고 없으면 생성  
  @SubscribeMessage('matchJoin')
  gameMatchJoin(
    @MessageBody() matchJoinData : MatchJoinData,
    @ConnectedSocket() client : Socket,
  ) {
    let gameManager : GameManager = this.gameService.randomMatchFind(this.gameRooms, matchJoinData);
    if (gameManager === undefined){
      gameManager = new GameManager(matchJoinData);
      gameManager.createPlayer(client.id, client.data.userId);
      this.gameService.socketJoinRoom(client, gameManager.gameId);
      this.gameRooms.set(gameManager.gameId, gameManager);
      this.logger.log(`gameCreate ${gameManager.gameId}`);
    } else {
      gameManager.createPlayer(client.id, client.data.userId);
      this.gameService.socketJoinRoom(client, gameManager.gameId);
      this.gameService.gamePreheat(gameManager, this.server);
    }
  }
  @SubscribeMessage('chatJoin')
  chatMatchJoin(
    @MessageBody() matchJoinData : ChatJoinData,
    @ConnectedSocket() client : Socket,
  ) {
    let gameManager : GameManager = this.gameService.ChatMatchFind(this.gameRooms, matchJoinData);
    if (gameManager === undefined){
      gameManager = new GameManager(matchJoinData);
      gameManager.createPlayer(client.id, client.data.userId);
      this.gameService.socketJoinRoom(client, gameManager.gameId);
      this.gameRooms.set(gameManager.gameId, gameManager);
      this.server.to(client.id).emit("onGameInvite", new InviteData(gameManager.gameId, matchJoinData.channelId, gameManager.gameType));
      this.logger.log(`gameCreate ${gameManager.gameId}`);
    } else {
      gameManager.createPlayer(client.id, client.data.userId);
      this.gameService.socketJoinRoom(client, gameManager.gameId);
      this.gameService.gamePreheat(gameManager, this.server);
    }
  }
  //game 시작전 나가기 누르면 매칭시스템에서 탈출
  //game 중에 나가면 게임 포기
  @SubscribeMessage('exit')
  matchExit(
    @ConnectedSocket() client : Socket,
  ) {
    this.gameService.gameExit(this.gameRooms, client);
  }

  //observe
  @SubscribeMessage('observeJoin')
  observerJoin(
    @MessageBody() observeData : ObserveData,
    @ConnectedSocket() client : Socket,
  ) {
    const gameManager : GameManager = this.gameRooms.get(observeData.gameId);
    if (gameManager?.started){
      this.gameService.initObserver(gameManager,this.server, client.id);
      this.gameService.socketJoinRoom(client, observeData.gameId);
    } else {
      throw new SocketException('BadRequest', "게임중인 방이 아닙니다.");
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
    } else {
      throw new SocketException('BadRequest', "player가 아닙니다.");
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
