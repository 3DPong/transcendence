/// <reference types="node" />
import { GameUser } from "./GameUser.js";
export declare class GameSkill {
    paddleDirectionSkillCount: number;
    paddleDirectionSkillTimeOut?: NodeJS.Timeout;
    ReverseEnemyPaddleDirection(enemyUser: GameUser): void;
}
