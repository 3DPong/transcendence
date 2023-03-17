import { GameModEnum } from "../enum/gameModEnum";
import { GameRoomTypeEnum } from "../enum/gameRoomTypeEnum";

export class createMatchDto {
  gameRoomType : GameRoomTypeEnum;
  gameMod : GameModEnum;
  
}