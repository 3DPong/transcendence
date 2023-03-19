import * as b2 from "@box2d";
import * as testbed from "@testbed";
export declare class WaveMachine extends testbed.Test {
    m_joint: b2.RevoluteJoint;
    m_time: number;
    constructor();
    Step(settings: testbed.Settings): void;
    GetDefaultViewZoom(): number;
    static Create(): WaveMachine;
}
export declare const testIndex: number;
