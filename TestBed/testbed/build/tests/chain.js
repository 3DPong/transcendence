// MIT License
System.register(["@box2d", "@testbed"], function (exports_1, context_1) {
    "use strict";
    var b2, testbed, TEST_BAD_BODY, Chain, testIndex;
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
            TEST_BAD_BODY = false;
            Chain = class Chain extends testbed.Test {
                constructor() {
                    super();
                    let ground = null;
                    {
                        const bd = new b2.BodyDef();
                        ground = this.m_world.CreateBody(bd);
                        const shape = new b2.EdgeShape();
                        shape.SetTwoSided(new b2.Vec2(-40.0, 0.0), new b2.Vec2(40.0, 0.0));
                        ground.CreateFixture(shape, 0.0);
                    }
                    {
                        const shape = new b2.PolygonShape();
                        shape.SetAsBox(0.6, 0.125);
                        const fd = new b2.FixtureDef();
                        fd.shape = shape;
                        fd.density = 20.0;
                        fd.friction = 0.2;
                        const jd = new b2.RevoluteJointDef();
                        jd.collideConnected = false;
                        const y = 25.0;
                        let prevBody = ground;
                        for (let i = 0; i < Chain.e_count; ++i) {
                            const bd = new b2.BodyDef();
                            bd.type = b2.BodyType.b2_dynamicBody;
                            bd.position.Set(0.5 + i, y);
                            const body = this.m_world.CreateBody(bd);
                            if (TEST_BAD_BODY) {
                                if (i === 10) {
                                    // Test zero density dynamic body
                                    fd.density = 0.0;
                                }
                                else {
                                    fd.density = 20.0;
                                }
                            }
                            body.CreateFixture(fd);
                            const anchor = new b2.Vec2(i, y);
                            jd.Initialize(prevBody, body, anchor);
                            this.m_world.CreateJoint(jd);
                            prevBody = body;
                        }
                    }
                }
                Step(settings) {
                    super.Step(settings);
                }
                static Create() {
                    return new Chain();
                }
            };
            exports_1("Chain", Chain);
            Chain.e_count = 30;
            exports_1("testIndex", testIndex = testbed.RegisterTest("Joints", "Chain", Chain.Create));
        }
    };
});
//# sourceMappingURL=chain.js.map