// noinspection ES6MissingAwait

import { GameType, InputEnum, PaddleState } from '../enum/GameEnum';
import { RoomType } from '../enum/GameEnum';
import { GameSimulator, step } from './GameSimulator';
import { GamePlayer } from './GamePlayer';
import { v4 as uuidv4 } from 'uuid';
import { Server } from 'socket.io';
import { GameService } from '../socket/services';
import { MATCH_SCORE } from '../enum/GameEnv';
import { RenderData, ScoreData, JoinDataInterface } from '../gameData';
import { Logger } from '@nestjs/common';

export class GameManager {
  public readonly gameId: string;
  public readonly gameRoomType: RoomType;
  public readonly gameType: GameType;
  public readonly channelId: number;
  public started: Boolean;
  public playerCount: number;
  public player1: GamePlayer;
  public player2: GamePlayer;
  public simulator: GameSimulator;
  public renderDatas: RenderData[];
  public scoreData: ScoreData;
  private logger: Logger;

  constructor(JoinData: JoinDataInterface) {
    this.gameRoomType = JoinData.roomType;
    this.gameType = JoinData.gameType;
    this.gameId = uuidv4();
    this.playerCount = 0;
    this.started = false;
    if (JoinData.roomType == RoomType.CHAT) {
      this.channelId = JoinData.channelId;
    } else {
      this.channelId = null;
    }
    this.logger = new Logger('GameManager');
  }

  public createPlayer(sid: string, dbId: number) {
    if (this.playerCount === 2) {
      return;
    }
    if (this.playerCount === 0) {
      this.player1 = new GamePlayer(sid, dbId);
    } else {
      this.player2 = new GamePlayer(sid, dbId);
    }
    ++this.playerCount;
  }

  public async gameStart(server: Server, gameService: GameService, gameRooms: Map<string, GameManager>) {
    const timeStep = setInterval(
      step,
      1 / 60,
      server,
      this.gameId,
      this.simulator,
      1 / 60,
      this.renderDatas,
      this.scoreData
    );
    const timeEndCheck = setInterval(
      async (
        simulator: GameSimulator,
        gameRooms: Map<string, GameManager>,
        gameManager: GameManager,
        gameService: GameService,
        server: Server
      ) => {
        if (
          simulator.ball.GetUserData().player1_score >= MATCH_SCORE ||
          simulator.ball.GetUserData().player2_score >= MATCH_SCORE ||
          simulator.matchInterrupt.isInterrupt
        ) {
          clearInterval(timeStep);
          clearInterval(timeEndCheck);
          
          if (!simulator.matchInterrupt.isInterrupt) {
            gameManager.player1.score = simulator.ball.GetUserData().player1_score;
            gameManager.player2.score = simulator.ball.GetUserData().player2_score;
          }
          await gameService
            .updateMatchRecode(gameManager)
            .catch(() =>{
              this.logger.error(
                `database update user_match failed : ${gameManager.gameId} ` +
                  `player1 score: ${gameManager.player1.score} ` +
                  `player2 score: ${gameManager.player2.score} ` +
                  `player1 dbId: ${gameManager.player1.dbId} ` +
                  `player2 dbId: ${gameManager.player2.dbId}`
              );
            })
          await gameService
            .createMatch(gameManager)
            .catch(() => {
              this.logger.error(
                `database save match failed : ${gameManager.gameId} ` +
                  `gameType: ${gameManager.gameType} ` +
                  `gameRoomType: ${gameManager.gameRoomType} ` +
                  `player1 score: ${gameManager.player1.score} ` +
                  `player2 score: ${gameManager.player2.score} ` +
                  `player1 dbId: ${gameManager.player1.dbId} ` +
                  `player2 dbId: ${gameManager.player2.dbId}`
              );
            });
            gameService.gameEndToClient(gameManager, server);
            gameRooms.delete(gameManager.gameId);
        }
      },
      100,
      this.simulator,
      gameRooms,
      this,
      gameService,
      server
    );
  }

  public Keyboard(key: InputEnum, sid: string) {
    let player: GamePlayer;
    let enemy: GamePlayer;
    if (this.player1.sid === sid) {
      player = this.player1;
      enemy = this.player2;
    } else {
      player = this.player2;
      enemy = this.player1;
    }
    switch (key) {
      case InputEnum.UP_START:
        player.directionButton = PaddleState.UP;
        break;
      case InputEnum.DOWN_START:
        player.directionButton = PaddleState.DOWN;
        break;
      case InputEnum.UP_END:
        player.directionButton = PaddleState.STOP;
        break;
      case InputEnum.DOWN_END:
        player.directionButton = PaddleState.STOP;
        break;
      case this.gameType == GameType.SPECIAL && InputEnum.SKILL:
        player.skill.ReverseEnemyPaddleDirection(enemy);
        break;
    }
  }
}
