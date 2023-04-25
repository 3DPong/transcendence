import { PaddleState } from '../enum/GameEnum';
import * as Box2D from '../Box2D';
import { GameSkill } from './GameSkill.js';

export class GamePlayer {
  public readonly sid: string;
  public dbId: number;
  public directionButton: PaddleState = PaddleState.STOP;
  public directionReverse: Boolean = false;
  public paddle: Box2D.Body;
  public skill: GameSkill;
  public score: number;

  constructor(sid: string, dbId: number) {
    this.skill = new GameSkill();
    this.sid = sid;
    this.dbId = dbId;
    this.score = 0;
  }
}
