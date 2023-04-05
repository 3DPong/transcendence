import { PlayerLocation } from "../enum/GameEnum";
import { ObjectData } from "../gameData/ObjectData";

interface MatchStartInterface {
  gameId : string; // 프론트에서 항상 데이터에 담아서 보내줘야 함.
	playerLocation : PlayerLocation; // 플레이어가 왼쪽인지 오른쪽인지 알려줌
	enemyUserId : number; // 상대방 유저 id
	sceneData : ObjectData[]; // Scene을 구성하는 물체들의 정보 
}

export class MatchStartData implements MatchStartInterface {
  public gameId : string;
	public playerLocation : PlayerLocation; 
	public enemyUserId : number;
	public sceneData : ObjectData[];
}