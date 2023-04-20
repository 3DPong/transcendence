import { GameType, RoomType} from "../enum/GameEnum";

interface MatchJoinInterface{
	roomType: RoomType; // 게임 참여 위치(채팅방, 랜덤매칭)
	gameType: GameType; // 게임 모드(기본모드, 장애물이나 스킬이 존재하는 특별 모드)
}

export class MatchJoinData implements MatchJoinInterface {
	public roomType: RoomType;
	public gameType: GameType;
}