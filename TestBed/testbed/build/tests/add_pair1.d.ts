import * as Box2D from "@box2d";
import * as testbed from "@testbed";
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
export declare class ObjectFactory {
    constructor();
    createBall(world: Box2D.World): void;
    createGround(world: Box2D.World): void;
    createPaddle(world: Box2D.World, x: number, y: number): void;
    createItem(world: Box2D.World): void;
}
export declare class AddPair extends testbed.Test {
    private world;
    private objectFactory;
    constructor();
    Keyboard(key: string): void;
    Step(settings: testbed.Settings): void;
    static Create(): testbed.Test;
}
export declare const testIndex: number;
