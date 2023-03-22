import { GameModEnum } from "./simul/enum/GameEnum";
import { GameRoomTypeEnum } from "./simul/enum/GameEnum";
import { Player } from "./player";

export class GameRoom {
  gameRoomType : GameRoomTypeEnum;
  gameMod : GameModEnum;
  id : string;
  players : Player[];
  observer : string[];// roomid 있으면 필요 없을거 같은데
}