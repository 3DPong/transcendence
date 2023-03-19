import * as Box2D from "@box2d";
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
    constructor(x: number, y: number);
}
export declare class ItemDef extends ObjectDefBase {
    constructor();
}
