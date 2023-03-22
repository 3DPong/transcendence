import * as testbed from "@testbed";
import { ObjectFactory } from "./object/ObjectFactory.js";
export declare class GameSimulator extends testbed.Test {
    objectFactory: ObjectFactory;
    private ball;
    private user1;
    private user2;
    constructor();
    Keyboard(key: string): void;
    KeyboardUp(key: string): void;
    Step(settings: testbed.Settings): void;
    static Create(): testbed.Test;
}
export declare const testIndex: number;
