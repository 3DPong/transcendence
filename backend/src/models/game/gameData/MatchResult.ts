interface MatchResultInterface{
  rightPlayerId : number; //player db id
	leftPlayerId : number; //player db id
	rightScore : number; //player end score
	leftScore : number; //player end score
	winner : number; //player db id
}

export class MatchResultData implements MatchResultInterface{
  public rightPlayerId : number;
	public leftPlayerId : number;
	public rightScore : number;
	public leftScore : number;
	public winner : number;
}