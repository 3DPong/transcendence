import { InputEnum } from "../enum/GameEnum";

interface InputInterface {
  gameId : string; //참가자의 게임 uid
	key : InputEnum;//입력한 key
}

export class InputData implements InputInterface {
  public gameId: string;
  public key: InputEnum;
}