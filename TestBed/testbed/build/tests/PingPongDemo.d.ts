import * as testbed from "@testbed";
import { ObjectFactory } from "./ts_Demo/simul/object/ObjectFactory.js";
export declare class AddPair extends testbed.Test {
    objectFactory: ObjectFactory;
    constructor();
    Keyboard(key: string): void;
    Step(settings: testbed.Settings): void;
    static Create(): testbed.Test;
}
export declare const testIndex: number;
