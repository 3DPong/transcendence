import { GameType } from "../enum/GameEnum";

export interface InviteDataInterface {
  gameId : string; 
	channelId : number;
  gameType : GameType;
}

export class InviteData implements InviteDataInterface {
	public readonly gameId: string;
	public readonly channelId: number;
  public readonly gameType : GameType;
  
  constructor (gameId: string, channelId: number, gameType : GameType){
    this.gameId = gameId;
    this.channelId = channelId;
    this.gameType = gameType;
  }
}