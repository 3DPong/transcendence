import * as Box2D from "@box2d";
export declare enum ObjectType {
    BALL = 0,
    PADDLE = 1
}
export declare class ObjectDefBase {
    objectBodyDef: Box2D.BodyDef;
    objectFixtureDef: Box2D.FixtureDef;
    constructor();
}
export declare class BallDef extends ObjectDefBase {
    constructor();
}
export declare class GroundDef extends ObjectDefBase {
    constructor();
}
export declare class PaddleDef extends ObjectDefBase {
    constructor(x: number, y: number, id: string);
}
export declare class ItemDef extends ObjectDefBase {
    constructor();
}
export declare class PinDef extends ObjectDefBase {
    constructor(posX: number, posY: number);
}
export declare class RectangleDef extends ObjectDefBase {
    constructor(posX: number, posY: number);
}
