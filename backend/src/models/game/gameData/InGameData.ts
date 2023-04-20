export class InGameData{
  id : string;
  name : string;
  pause : boolean;
  player1_score : number;
  player2_score : number;
  constructor (id :string, name :string){
    this.id = id;
    this.name = name;
    this.pause = true;
    this.player1_score = 0;
    this.player2_score = 0;
  }
}