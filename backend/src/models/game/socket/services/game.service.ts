import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Socket } from 'socket.io'
import { GameManager} from '../../simul/GameManager';
import { GamePlayer } from '../../simul/GamePlayer';
import { MATCH_SCORE } from '../../enum/GameEnv';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from '../../entities';
import { Repository } from 'typeorm';
import { MatchJoinData, MatchResultData, OnSceneData, ScoreData,ChatJoinData } from '../../gameData';
import { Server} from 'socket.io'
import { GameDataMaker } from './game.data.maker';
import { GameSimulator } from '../../simul/GameSimulator';
import { RoomType } from '../../enum/GameEnum';
import { SocketException } from 'src/common/filters/socket/socket.filter';
@Injectable()
export class GameService {
  private logger : Logger;
  constructor (
    private gameDataMaker : GameDataMaker,
    @InjectRepository(Match) 
    private matchRepository : Repository<Match>,
  ) {
    this.logger = new Logger("gameService");
  }

  public socketJoinRoom(client : Socket, roomId: string){
    client.join(roomId);
    client.data.gameId = roomId;
  }

  public socketLeaveRoom(client : Socket, roomId: string){
    client.leave(roomId);
    client.data.gameId = undefined;
  }

  public randomMatchFind(
    gameRooms : Map<string, GameManager>, 
    matchJoinData : MatchJoinData
  ) : GameManager {
    for (const manager of gameRooms.values()){
      if (
        manager.gameType === matchJoinData.gameType &&
        manager.gameRoomType === RoomType.RANDOM &&
        manager.playerCount === 1
      ) {
        return manager;
      }
    }
    return undefined;
  }

  public ChatMatchFind(
    gameRooms : Map<string, GameManager>, 
    chatJoinData : ChatJoinData
  ) : GameManager {
    if (!chatJoinData.gameId){
      return undefined;
    }
    //gameId는 있는데 아래 get에서 실패하면 이미 끝난게임에 접근하려하므로 에러처리
    const gameManager : GameManager = gameRooms.get(chatJoinData.gameId);
    if (
      gameManager.playerCount === 1
    ) {
      return gameManager;
    }
    throw new SocketException('BadRequest', '사라진 방 입니다.');
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
    gameManager.simulator.matchInterrupt.isInterrupt = true;
    gameManager.simulator.matchInterrupt.sid = sid;
  }

  public gamePreheat(gameManager : GameManager, server : Server){
    gameManager.simulator = new GameSimulator(gameManager.player1, gameManager.player2, gameManager.gameType);
    gameManager.renderDatas = this.gameDataMaker.makeRenderDatas(gameManager);
    gameManager.scoreData = new ScoreData();

    const player1sid : string = gameManager.player1.sid;
    const player2sid : string = gameManager.player2.sid;
    const onSceneData1 : OnSceneData = this.gameDataMaker.makeOnSceneData(gameManager, player1sid);
    const onSceneData2 : OnSceneData = this.gameDataMaker.makeOnSceneData(gameManager, player2sid);

    server.to(player1sid).emit('onSceneReady', onSceneData1);
    server.to(player2sid).emit('onSceneReady', onSceneData2);
  }
  
  public initObserver(gameManager : GameManager, server : Server, sid : string){
    const onSceneData : OnSceneData = this.gameDataMaker.makeObserverData(gameManager);
    server.to(sid).emit('onSceneReady', onSceneData);
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

  public isGamePalyer(gameManager : GameManager, sid : string) : boolean {
    if (gameManager.player1.sid == sid || gameManager.player2.sid == sid){
      return true;
    }
    return false;
  }
  //게임시작전
  //게임시작후
  //옵저빙 중에 탈출
  public gameExit(gameRooms : Map<string, GameManager> , client : Socket){
    const gameManager : GameManager = gameRooms.get(client.data.gameId);
    if (!gameManager) return;

    if (gameManager.playerCount === 1 && this.isGamePalyer(gameManager, client.id)) {
      gameRooms.delete(client.data.gameId);
      this.socketLeaveRoom(client, gameManager.gameId);
      this.logger.log(`${client.id} is disconnect game socket and delete ${gameManager.gameId}`);
      
    } else if (
      gameManager.playerCount === 2 && 
      gameManager.simulator.matchInterrupt.isInterrupt === false
    ) {
      if (this.isGamePalyer(gameManager, client.id)){//player
        this.matchGiveUp(gameManager, client.id);
        this.logger.log(`${client.id} player disconnect and giveUp game`);
      } else { //observer
        this.logger.log(`${client.id} observer leave game room`);
        this.socketLeaveRoom(client, gameManager.gameId);
      }
    }
  }
}
