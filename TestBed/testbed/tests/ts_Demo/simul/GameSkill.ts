import { GameUser } from "./GameUser.js";

export class GameSkill {
  public paddleDirectionSkillCount : number = 1;
  public paddleDirectionSkillTimeOut ?: NodeJS.Timeout;

  public ReverseEnemyPaddleDirection(enemyUser : GameUser){
    enemyUser.directionReverse = true;
    --this.paddleDirectionSkillCount;
    this.paddleDirectionSkillTimeOut = setTimeout(
      () => enemyUser.directionReverse = false,
      5000
    );
  }
}