interface ObserveInterface {
  gameId: string; //관전자가 관전하려는 게임 방 uid를 보내주면 소켓룸에 join
}

export class ObserveData implements ObserveInterface {
  public gameId: string;
}
