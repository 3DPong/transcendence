import { Injectable } from '@nestjs/common';

export class GameMatchStats {
  socketId : number;
  //mmr : number;
} 
@Injectable()
export class MatchService {

  matchWatingList : GameMatchStats[];

  joinMatchList(socketId : number){
    this.matchWatingList.push({socketId});
    this.startMatch();
  }

  exitMatchList(socketId : number){
    const filterFunction = (stats: GameMatchStats) => stats.socketId !== socketId;
    this.matchWatingList = this.matchWatingList.filter(filterFunction);
  }

  startMatch(){
    while (this.matchWatingList.length >= 2){
      const player1 = this.matchWatingList.shift();
      const player2 = this.matchWatingList.shift();
      //socket service call
    }
  }
}

