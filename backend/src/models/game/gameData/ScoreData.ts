interface ScoreInterface {
  rightSocre : number; //오른쪽 플레이어 점수
  leftScore : number; //외쪽 플레이어 점수
}

export class ScoreData implements ScoreInterface {
  public rightSocre: number = 0;
  public leftScore: number = 0;
}