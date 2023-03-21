import { ObjectType } from "./ObjectDef";
export declare class InGameData {
    readonly id: string;
    pause: Boolean;
    type: ObjectType;
    player1_score: number;
    player2_score: number;
    constructor(id: string, type: ObjectType);
}
