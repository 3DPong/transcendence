// MIT License
System.register(["@box2d", "@testbed"], function (exports_1, context_1) {
    "use strict";
    var b2, testbed, ContinuousTest, testIndex;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (b2_1) {
                b2 = b2_1;
            },
            function (testbed_1) {
                testbed = testbed_1;
            }
        ],
        execute: function () {
            ContinuousTest = class ContinuousTest extends testbed.Test {
                constructor() {
                    super();
                    this.m_angularVelocity = 0.0;
                    {
                        const bd = new b2.BodyDef();
                        bd.position.Set(0.0, 0.0);
                        const body = this.m_world.CreateBody(bd);
                        const edge = new b2.EdgeShape();
                        edge.SetTwoSided(new b2.Vec2(-10.0, 0.0), new b2.Vec2(10.0, 0.0));
                        body.CreateFixture(edge, 0.0);
                        const shape = new b2.PolygonShape();
                        shape.SetAsBox(0.2, 1.0, new b2.Vec2(0.5, 1.0), 0.0);
                        body.CreateFixture(shape, 0.0);
                    }
                    {
                        const bd = new b2.BodyDef();
                        bd.type = b2.BodyType.b2_dynamicBody;
                        bd.position.Set(0.0, 20.0);
                        //bd.angle = 0.1;
                        const shape = new b2.PolygonShape();
                        shape.SetAsBox(2.0, 0.1);
                        this.m_body = this.m_world.CreateBody(bd);
                        this.m_body.CreateFixture(shape, 1.0);
                        this.m_angularVelocity = b2.RandomRange(-50.0, 50.0);
                        //this.m_angularVelocity = 46.661274;
                        this.m_body.SetLinearVelocity(new b2.Vec2(0.0, -100.0));
                        this.m_body.SetAngularVelocity(this.m_angularVelocity);
                    }
                    /*
                    else
                    {
                      const bd = new b2.BodyDef();
                      bd.type = b2.BodyType.b2_dynamicBody;
                      bd.position.Set(0.0, 2.0);
                      const body = this.m_world.CreateBody(bd);
                      const shape = new b2.CircleShape();
                      shape.m_p.SetZero();
                      shape.m_radius = 0.5;
                      body.CreateFixture(shape, 1.0);
                      bd.bullet = true;
                      bd.position.Set(0.0, 10.0);
                      body = this.m_world.CreateBody(bd);
                      body.CreateFixture(shape, 1.0);
                      body.SetLinearVelocity(new b2.Vec2(0.0, -100.0));
                    }
                    */
                    // b2.gjkCalls = 0;
                    // b2.gjkIters = 0;
                    // b2.gjkMaxIters = 0;
                    b2.gjk_reset();
                    // b2.toiCalls = 0;
                    // b2.toiIters = 0;
                    // b2.toiRootIters = 0;
                    // b2.toiMaxRootIters = 0;
                    // b2.toiTime = 0.0;
                    // b2.toiMaxTime = 0.0;
                    b2.toi_reset();
                }
                Launch() {
                    // b2.gjkCalls = 0;
                    // b2.gjkIters = 0;
                    // b2.gjkMaxIters = 0;
                    b2.gjk_reset();
                    // b2.toiCalls = 0;
                    // b2.toiIters = 0;
                    // b2.toiRootIters = 0;
                    // b2.toiMaxRootIters = 0;
                    // b2.toiTime = 0.0;
                    // b2.toiMaxTime = 0.0;
                    b2.toi_reset();
                    this.m_body.SetTransformVec(new b2.Vec2(0.0, 20.0), 0.0);
                    this.m_angularVelocity = b2.RandomRange(-50.0, 50.0);
                    this.m_body.SetLinearVelocity(new b2.Vec2(0.0, -100.0));
                    this.m_body.SetAngularVelocity(this.m_angularVelocity);
                }
                Step(settings) {
                    super.Step(settings);
                    if (b2.gjkCalls > 0) {
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "gjk calls = %d, ave gjk iters = %3.1f, max gjk iters = %d",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `gjk calls = ${b2.gjkCalls.toFixed(0)}, ave gjk iters = ${(b2.gjkIters / b2.gjkCalls).toFixed(1)}, max gjk iters = ${b2.gjkMaxIters.toFixed(0)}`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    }
                    if (b2.toiCalls > 0) {
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "toi [max] calls = %d, ave toi iters = %3.1f [%d]",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `toi [max] calls = ${b2.toiCalls}, ave toi iters = ${(b2.toiIters / b2.toiCalls).toFixed(1)} [${b2.toiMaxRootIters}]`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "ave [max] toi root iters = %3.1f [%d]",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `ave [max] toi root iters = ${(b2.toiRootIters / b2.toiCalls).toFixed(1)} [${b2.toiMaxRootIters.toFixed(0)}]`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                        // testbed.g_debugDraw.DrawString(5, this.m_textLine, "ave [max] toi time = %.1f [%.1f] (microseconds)",
                        testbed.g_debugDraw.DrawString(5, this.m_textLine, `ave [max] toi time = ${(1000.0 * b2.toiTime / b2.toiCalls).toFixed(1)} [${(1000.0 * b2.toiMaxTime).toFixed(1)}] (microseconds)`);
                        this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    }
                    if (this.m_stepCount % 60 === 0) {
                        this.Launch();
                    }
                }
                static Create() {
                    return new ContinuousTest();
                }
            };
            exports_1("ContinuousTest", ContinuousTest);
            exports_1("testIndex", testIndex = testbed.RegisterTest("Continuous", "Continuous Test", ContinuousTest.Create));
        }
    };
});
//# sourceMappingURL=continuous_test.js.map