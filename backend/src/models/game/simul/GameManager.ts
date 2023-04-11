import { GameType, InputEnum, PaddleState } from "../enum/GameEnum";
import { RoomType } from "../enum/GameEnum";
import { GameSimulator, step} from "./GameSimulator";
import { GamePlayer } from "./GamePlayer";
import { v4 as uuidv4} from 'uuid';
import { Server} from 'socket.io'
import { GameService } from "../socket/services";
import { MATCH_SCORE } from "../enum/GameEnv";
import { Min } from "../Box2D";
import { MatchJoinData, RenderData, ScoreData } from "../gameData";
import { Logger } from "@nestjs/common";

export class GameManager {
  public readonly gameId : string;
  public readonly gameRoomType : RoomType;
  public readonly gameType : GameType;
  public started : Boolean;
  public playerCount : number;
  public player1 : GamePlayer;
  public player2 : GamePlayer;
  public simulator : GameSimulator;
  public renderDatas : RenderData[];
  public scoreData : ScoreData;
  private logger : Logger;

  constructor(matchJoinData : MatchJoinData)
  {
    this.gameRoomType = matchJoinData.roomType;
    this.gameType = matchJoinData.gameType;
    this.gameId = uuidv4();
    this.playerCount = 0;
    this.started = false;
    this.logger = new Logger();
  }

  public createPlayer(sid : string, dbId : number) {
    if (this.playerCount === 2){
      return ;
    }
    if (this.playerCount === 0){
      this.player1 = new GamePlayer(sid, dbId);
    } else {
      this.player2 = new GamePlayer(sid, dbId);
    }
    ++this.playerCount;
  }

  public async gameStart(
    server : Server, 
    gameService : GameService,
    gameRooms : Map<string, GameManager>
  ){
    const timeStep = setInterval(step, 1/60, server, this.gameId, this.simulator, 1/60 ,this.renderDatas, this.scoreData);
    const timeEndCheck = setInterval(
      async (
        simulator : GameSimulator,
        gameRooms : Map<string,GameManager>,
        gameManager : GameManager,
        gameService : GameService,
        server : Server
      ) => {
      if (
        simulator.ball.GetUserData().player1_score === MATCH_SCORE || 
        simulator.ball.GetUserData().player2_score === MATCH_SCORE ||
        simulator.matchInterrupt.isInterrupt
      ) {
        clearInterval(timeStep);
        simulator.user1.socore = Min(simulator.ball.GetUserData().player1_score, simulator.user1.socore);
        simulator.user2.socore = Min(simulator.ball.GetUserData().player2_score, simulator.user2.socore);
        console.log('allClear interval');
        gameService.gameEndToClient(gameManager, server);
        clearInterval(timeEndCheck);
        await gameService.createMatch(gameManager).then(()=>{
          gameRooms.delete(gameManager.gameId);
        }).catch(()=>{
          gameRooms.delete(gameManager.gameId);
          this.logger.error(`database save match failed : ${this.gameId}`);
        });
      }},1000, this.simulator, gameRooms, this, gameService, server);
  }

  public Keyboard(key : InputEnum, sid : string) {
    let player : GamePlayer;
    let enemy : GamePlayer;
    if (this.player1.sid === sid){
      player = this.player1;
      enemy = this.player2;
    } else {
      player = this.player2;
      enemy = this.player1;
    }
    switch (key) {
      case InputEnum.UP:
        if (player.directionButton === PaddleState.STOP){
          player.directionButton = PaddleState.UP;
        } else {
          player.directionButton = PaddleState.STOP;
        }
      break;
      case InputEnum.DOWN:
        if (player.directionButton === PaddleState.STOP){
          player.directionButton = PaddleState.DOWN;
        } else {
          player.directionButton = PaddleState.STOP;
        }
      break;
      case this.gameType == GameType.SPECIAL && InputEnum.SKILL:
        player.skill.ReverseEnemyPaddleDirection(enemy);
      break;
    }
  }
}