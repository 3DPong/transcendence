import { ObjectType } from "./ObjectDef";

export class InGameData {
  public readonly id : string;
  public pause : Boolean;
  public type : ObjectType;
  public player1_score : number;
  public player2_score : number;

  constructor(id : string, type : ObjectType){
    this.id = id;
    this.pause = false;
    this.type = type;
    this.player1_score = 0;
    this.player2_score = 0;
  }
}