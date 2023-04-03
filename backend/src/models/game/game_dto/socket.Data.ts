import { GameType, RoomType, PlayerLocation, inputEnum } from "../enum/GameEnum";
import * as Box2D from "../Box2D";

export class MatchJoinData {
	userId: number; // user_id --> 게임 룸 만들때 백에서 필요.
	roomType: RoomType; // 방 타입
	gameType: GameType; // 게임 모드
}


export class MatchStartData {
  gameId : string; // 프론트에서 항상 데이터에 담아서 보내줘야 함.
	playerLocation : PlayerLocation; // 플레이어가 왼쪽인지 오른쪽인지 알려줌
	enemyUserId : number; // 상대방 유저 id
	sceneData : ObjectData[]; // Scene을 구성하는 물체들의 정보 
  // 이렇게 하는 이유는, engine에서 움직이지 않은 물체는 정보를 보내줄 필요가 없기 때문.
	// 위치가 바뀐(=awake) object만 데이터를 전송.
}

export class ObserveData {
  gameId : string; // 프론트에서 항상 데이터에 담아서 보내줘야 함.
}

//초기에 보내줘서 셋팅
export class ObjectData {
  objectId : number | string; // object identifier, id must be unique
  shapeType : Box2D.ShapeType;    // object type
  x : number;         // initial pos x
  y : number;         // initial pos x
  angle : number;     // initial angle
  radius ?: number;   // initial radius
  vertex ?: Box2D.Vec2[];  // initial vertex (if e_polygon)
}

//게임 중간중간 움직임이 발생한 data보내줌
export class RenderData {
	objectId : string | number; // 타입은 나중에 정할 것. (프론트에서 map 탐색에 사용)
	x : number;
	y : number;
	angle : number;
}
export class ScoreData{
  rightScore : number;
  leftScore : number;
}

export class InputData {
	gameId : string;
	key : inputEnum;
}

export class MatchResult{
	rightPlayerId : number;
	leftPlayerId : number;
	rightScore : number;
	leftScore : number;
	winner : number; //id
}