import { GameModEnum, PaddleState } from "./enum/GameEnum";
import { GameRoomTypeEnum } from "./enum/GameEnum";
import { GameSimulator, step} from "./GameSimulator";
import { GamePlayer } from "./GamePlayer";
import { v4 as uuidv4} from 'uuid';
import { Server} from 'socket.io'
import { GameService } from "../socket/services";
import { MatchDto } from "../game_dto/createMatch.dto";
import { MATCH_SCORE } from "./enum/GameEnv";
import { Min } from "../Box2D";


export class GameManager {
  public readonly gameId : string;
  public readonly gameRoomType : GameRoomTypeEnum;
  public readonly gameMod : GameModEnum;
  public playerCount : number;
  public player1 : GamePlayer;
  public player2 : GamePlayer;
  public simulator : GameSimulator;

  constructor(matchDto : MatchDto)
  {
    this.gameRoomType = matchDto.gameRoomType;
    this.gameMod = matchDto.gameMod;
    this.gameId = uuidv4();
    this.playerCount = 0;
  }

  public createPlayer(sid : string) {
    if (this.playerCount === 2){
      return ;
    }
    if (this.playerCount === 0){
      this.player1 = new GamePlayer(sid);
    } else {
      this.player2 = new GamePlayer(sid);
    }
    ++this.playerCount;
  }

  public async gameStart(
    server : Server, 
    gameService : GameService,
    gameRooms : Map<string, GameManager>
  ){
    this.simulator = new GameSimulator(this.player1, this.player2);
    const timeStep = setInterval(step, 1000, server, this.gameId, this.simulator);
    const timeEndCheck = setInterval(
    async(
      simulator : GameSimulator,
      gameRooms : Map<string,GameManager>,
      gameManager : GameManager,
      gameService : GameService
    ) => {
    if (
      simulator.ball.GetUserData().player1_score === MATCH_SCORE || 
      simulator.ball.GetUserData().player2_score === MATCH_SCORE ||
      simulator.matchInterrupt.isInterrupt
    ) {
      clearInterval(timeEndCheck);
      clearInterval(timeStep);
      simulator.user1.socore = Min(simulator.ball.GetUserData().player1_score, simulator.user1.socore);
      simulator.user2.socore = Min(simulator.ball.GetUserData().player2_score, simulator.user2.socore);
      console.log('allClear interval');
      await gameService.gameEnd(gameRooms, gameManager);
    }},1000, this.simulator, gameRooms, this, gameService)
  }

  public Keyboard(key: string, sid : string) {
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
      case 'w':
        player.directionButton = PaddleState.UP;
      break;
      case 's':
        player.directionButton = PaddleState.DOWN;
      break;
      case 'q':
        player.skill.ReverseEnemyPaddleDirection(enemy);
      break;
    }
  }

  public KeyboardUp(key: string, sid : string) {
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
      case 'w':
        player.directionButton = PaddleState.STOP;
      break;
      case 's':
        player.directionButton = PaddleState.STOP;
      break;
      case 'q':
        player.skill.ReverseEnemyPaddleDirection(enemy);
      break;
    }
  }
}