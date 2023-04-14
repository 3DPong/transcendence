// https://www.notion.so/kyeu/Game-API-dc98bf16c57248efa4b8bdd6896b1047?p=e11c9bfe609e4179b02d538efe944bd2&pm=s
export enum roomType {
  random, // 랜덤매치
  chat, // 채팅을 통해 참여
}

export enum gameType {
  normal, // 기본 모드
  special, // 방해물 모드
}

export interface MatchJoinData {
  userId: number; // user_id --> 게임 룸 만들때 백에서 필요.
  roomType: roomType; // 방 타입
  gameType: gameType; // 게임 모드
}

export interface Vec2 {
  x: number;
  y: number;
}

export enum b2ShapeType {
  e_unknown = -1,
  e_circleShape = 0,
  e_edgeShape = 1,
  e_polygonShape = 2,
  e_chainShape = 3,
  e_shapeTypeCount = 4,
}

export type objectId = string;

export interface objectData {
  objectId: objectId; // object identifier, id must be unique
  shapeType: b2ShapeType; // object type
  x: number; // initial pos x
  y: number; // initial pos x
  angle: number; // initial angle
  radius?: number; // initial radius
  vertex?: Vec2[]; // initial vertex (if e_polygon)
}

export enum PlayerLocation {
  RIGHT,
  LEFT,
}

export interface matchStartData {
  gameId: string; // 프론트에서 항상 데이터에 담아서 보내줘야 함.
  playerLocation: PlayerLocation; // 플레이어가 왼쪽인지 오른쪽인지 알려줌
  enemyUserId: number; // 상대방 유저 id
  sceneData: objectData[]; // Scene을 구성하는 물체들의 정보
  // 이렇게 하는 이유는, engine에서 움직이지 않은 물체는 정보를 보내줄 필요가 없기 때문.
  // 위치가 바뀐(=awake) object만 데이터를 전송.
}

export interface renderData {
  objectId: objectId;
  x: number;
  y: number;
  angle: number;
}

export enum inputEnum{
  UP_START,
  DOWN_START,
  SKILL,
  UP_END,
  DOWN_END,
}

export interface inputData {
  gameId: string;
  key: inputEnum;
}

export interface matchResult {
  rightPlayerId: number;
  leftPlayerId: number;
  rightScore: number;
  leftScore: number;
  winner: number; //id
}

export interface PlayerData {
  myImage: string;
  myNickName: string;
  enemyImage: string;
  enemyNickName: string;
}

export interface scoreData{
  rightScore : number;
  leftScore : number;
}
