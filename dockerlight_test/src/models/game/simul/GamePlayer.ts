import { PaddleState } from "./enum/GameEnum";
import * as Box2D from "../Box2D";
import { GameSkill } from "./GameSkill.js";

export class GamePlayer{
  public readonly sid : string;
  
  public directionButton : PaddleState = PaddleState.STOP;
  public directionReverse : Boolean = false;
  public paddle : Box2D.Body;
  public skill : GameSkill;
  public socore : number;
  constructor (sid: string){
    this.skill = new GameSkill();
    this.sid = sid;
    this.socore = 0;
  }
}