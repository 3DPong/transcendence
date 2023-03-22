import { PaddleState } from "./GameEnum.js";
import * as Box2D from "@box2d";
import { GameSkill } from "./GameSkill.js";
export declare class GameUser {
    directionButton: PaddleState;
    directionReverse: Boolean;
    paddle: Box2D.Body;
    skill: GameSkill;
    constructor(paddle: Box2D.Body);
}
