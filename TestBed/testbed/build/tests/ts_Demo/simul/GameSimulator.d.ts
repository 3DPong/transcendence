import * as testbed from "@testbed";
import { ObjectFactory } from "./object/ObjectFactory.js";
export declare enum PaddleState {
    UP = 0,
    DOWN = 1,
    STOP = 2
}
export declare class GameSimulator extends testbed.Test {
    objectFactory: ObjectFactory;
    private ball;
    private leftPaddle;
    private rightPaddle;
    private leftButton;
    private rightButton;
    constructor();
    Keyboard(key: string): void;
    KeyboardUp(key: string): void;
    Step(settings: testbed.Settings): void;
    static Create(): testbed.Test;
}
export declare const testIndex: number;
