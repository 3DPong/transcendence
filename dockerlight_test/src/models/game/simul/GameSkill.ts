import { GamePlayer } from "./GamePlayer.js";

export class GameSkill {
  public paddleDirectionSkillCount : number = 1;
  public paddleDirectionSkillTimeOut ?: NodeJS.Timeout;

  public ReverseEnemyPaddleDirection(enemyUser : GamePlayer){
    enemyUser.directionReverse = true;
    --this.paddleDirectionSkillCount;
    this.paddleDirectionSkillTimeOut = setTimeout(
      () => enemyUser.directionReverse = false,
      5000
    );
  }
}