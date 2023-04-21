export interface InviteDataInterface {
  gameId : string; 
	channelId : number;
}

export class InviteData implements InviteDataInterface {
	public readonly gameId: string;
	public readonly channelId: number;
  
  constructor (gameId: string, channelId: number){
    this.gameId = gameId;
    this.channelId = channelId;
  }
}