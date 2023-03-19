import * as Box2D from "@box2d";
export declare class ObjectFactory {
    createBall(world: Box2D.World): Box2D.Body;
    createGround(world: Box2D.World): void;
    createPaddle(world: Box2D.World, x: number, y: number): Box2D.Body;
    createItem(world: Box2D.World): Box2D.Body;
}
