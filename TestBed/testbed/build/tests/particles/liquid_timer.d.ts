import * as testbed from "@testbed";
export declare class LiquidTimer extends testbed.Test {
    static readonly k_paramValues: testbed.ParticleParameterValue[];
    static readonly k_paramDef: testbed.ParticleParameterDefinition[];
    static readonly k_paramDefCount: number;
    constructor();
    GetDefaultViewZoom(): number;
    static Create(): LiquidTimer;
}
export declare const testIndex: number;
