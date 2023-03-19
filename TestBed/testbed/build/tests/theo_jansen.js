// MIT License
System.register(["@box2d", "@testbed"], function (exports_1, context_1) {
    "use strict";
    var b2, testbed, TheoJansen, testIndex;
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
            TheoJansen = class TheoJansen extends testbed.Test {
                constructor() {
                    super();
                    this.m_offset = new b2.Vec2();
                    this.m_motorOn = false;
                    this.m_motorSpeed = 0;
                    this.Construct();
                }
                CreateLeg(s, wheelAnchor) {
                    const p1 = new b2.Vec2(5.4 * s, -6.1);
                    const p2 = new b2.Vec2(7.2 * s, -1.2);
                    const p3 = new b2.Vec2(4.3 * s, -1.9);
                    const p4 = new b2.Vec2(3.1 * s, 0.8);
                    const p5 = new b2.Vec2(6.0 * s, 1.5);
                    const p6 = new b2.Vec2(2.5 * s, 3.7);
                    const fd1 = new b2.FixtureDef();
                    const fd2 = new b2.FixtureDef();
                    fd1.filter.groupIndex = -1;
                    fd2.filter.groupIndex = -1;
                    fd1.density = 1.0;
                    fd2.density = 1.0;
                    const poly1 = new b2.PolygonShape();
                    const poly2 = new b2.PolygonShape();
                    if (s > 0.0) {
                        const vertices = new Array();
                        vertices[0] = p1;
                        vertices[1] = p2;
                        vertices[2] = p3;
                        poly1.Set(vertices);
                        vertices[0] = b2.Vec2_zero;
                        vertices[1] = b2.Vec2.SubVV(p5, p4, new b2.Vec2());
                        vertices[2] = b2.Vec2.SubVV(p6, p4, new b2.Vec2());
                        poly2.Set(vertices);
                    }
                    else {
                        const vertices = new Array();
                        vertices[0] = p1;
                        vertices[1] = p3;
                        vertices[2] = p2;
                        poly1.Set(vertices);
                        vertices[0] = b2.Vec2_zero;
                        vertices[1] = b2.Vec2.SubVV(p6, p4, new b2.Vec2());
                        vertices[2] = b2.Vec2.SubVV(p5, p4, new b2.Vec2());
                        poly2.Set(vertices);
                    }
                    fd1.shape = poly1;
                    fd2.shape = poly2;
                    const bd1 = new b2.BodyDef();
                    const bd2 = new b2.BodyDef();
                    bd1.type = b2.BodyType.b2_dynamicBody;
                    bd2.type = b2.BodyType.b2_dynamicBody;
                    bd1.position.Copy(this.m_offset);
                    bd2.position.Copy(b2.Vec2.AddVV(p4, this.m_offset, new b2.Vec2()));
                    bd1.angularDamping = 10.0;
                    bd2.angularDamping = 10.0;
                    const body1 = this.m_world.CreateBody(bd1);
                    const body2 = this.m_world.CreateBody(bd2);
                    body1.CreateFixture(fd1);
                    body2.CreateFixture(fd2);
                    {
                        const jd = new b2.DistanceJointDef();
                        // Using a soft distance constraint can reduce some jitter.
                        // It also makes the structure seem a bit more fluid by
                        // acting like a suspension system.
                        const dampingRatio = 0.5;
                        const frequencyHz = 10.0;
                        jd.Initialize(body1, body2, b2.Vec2.AddVV(p2, this.m_offset, new b2.Vec2()), b2.Vec2.AddVV(p5, this.m_offset, new b2.Vec2()));
                        b2.LinearStiffness(jd, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);
                        this.m_world.CreateJoint(jd);
                        jd.Initialize(body1, body2, b2.Vec2.AddVV(p3, this.m_offset, new b2.Vec2()), b2.Vec2.AddVV(p4, this.m_offset, new b2.Vec2()));
                        b2.LinearStiffness(jd, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);
                        this.m_world.CreateJoint(jd);
                        jd.Initialize(body1, this.m_wheel, b2.Vec2.AddVV(p3, this.m_offset, new b2.Vec2()), b2.Vec2.AddVV(wheelAnchor, this.m_offset, new b2.Vec2()));
                        b2.LinearStiffness(jd, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);
                        this.m_world.CreateJoint(jd);
                        jd.Initialize(body2, this.m_wheel, b2.Vec2.AddVV(p6, this.m_offset, new b2.Vec2()), b2.Vec2.AddVV(wheelAnchor, this.m_offset, new b2.Vec2()));
                        b2.LinearStiffness(jd, frequencyHz, dampingRatio, jd.bodyA, jd.bodyB);
                        this.m_world.CreateJoint(jd);
                    }
                    {
                        const jd = new b2.RevoluteJointDef();
                        jd.Initialize(body2, this.m_chassis, b2.Vec2.AddVV(p4, this.m_offset, new b2.Vec2()));
                        this.m_world.CreateJoint(jd);
                    }
                }
                Construct() {
                    this.m_offset.Set(0.0, 8.0);
                    this.m_motorSpeed = 2.0;
                    this.m_motorOn = true;
                    const pivot = new b2.Vec2(0.0, 0.8);
                    // Ground
                    {
                        const bd = new b2.BodyDef();
                        const ground = this.m_world.CreateBody(bd);
                        const shape = new b2.EdgeShape();
                        shape.SetTwoSided(new b2.Vec2(-50.0, 0.0), new b2.Vec2(50.0, 0.0));
                        ground.CreateFixture(shape, 0.0);
                        shape.SetTwoSided(new b2.Vec2(-50.0, 0.0), new b2.Vec2(-50.0, 10.0));
                        ground.CreateFixture(shape, 0.0);
                        shape.SetTwoSided(new b2.Vec2(50.0, 0.0), new b2.Vec2(50.0, 10.0));
                        ground.CreateFixture(shape, 0.0);
                    }
                    // Balls
                    for (let i = 0; i < 40; ++i) {
                        const shape = new b2.CircleShape();
                        shape.m_radius = 0.25;
                        const bd = new b2.BodyDef();
                        bd.type = b2.BodyType.b2_dynamicBody;
                        bd.position.Set(-40.0 + 2.0 * i, 0.5);
                        const body = this.m_world.CreateBody(bd);
                        body.CreateFixture(shape, 1.0);
                    }
                    // Chassis
                    {
                        const shape = new b2.PolygonShape();
                        shape.SetAsBox(2.5, 1.0);
                        const sd = new b2.FixtureDef();
                        sd.density = 1.0;
                        sd.shape = shape;
                        sd.filter.groupIndex = -1;
                        const bd = new b2.BodyDef();
                        bd.type = b2.BodyType.b2_dynamicBody;
                        bd.position.Copy(pivot).SelfAdd(this.m_offset);
                        this.m_chassis = this.m_world.CreateBody(bd);
                        this.m_chassis.CreateFixture(sd);
                    }
                    {
                        const shape = new b2.CircleShape();
                        shape.m_radius = 1.6;
                        const sd = new b2.FixtureDef();
                        sd.density = 1.0;
                        sd.shape = shape;
                        sd.filter.groupIndex = -1;
                        const bd = new b2.BodyDef();
                        bd.type = b2.BodyType.b2_dynamicBody;
                        bd.position.Copy(pivot).SelfAdd(this.m_offset);
                        this.m_wheel = this.m_world.CreateBody(bd);
                        this.m_wheel.CreateFixture(sd);
                    }
                    {
                        const jd = new b2.RevoluteJointDef();
                        jd.Initialize(this.m_wheel, this.m_chassis, b2.Vec2.AddVV(pivot, this.m_offset, new b2.Vec2()));
                        jd.collideConnected = false;
                        jd.motorSpeed = this.m_motorSpeed;
                        jd.maxMotorTorque = 400.0;
                        jd.enableMotor = this.m_motorOn;
                        this.m_motorJoint = this.m_world.CreateJoint(jd);
                    }
                    const wheelAnchor = b2.Vec2.AddVV(pivot, new b2.Vec2(0.0, -0.8), new b2.Vec2());
                    this.CreateLeg(-1.0, wheelAnchor);
                    this.CreateLeg(1.0, wheelAnchor);
                    this.m_wheel.SetTransformVec(this.m_wheel.GetPosition(), 120.0 * b2.pi / 180.0);
                    this.CreateLeg(-1.0, wheelAnchor);
                    this.CreateLeg(1.0, wheelAnchor);
                    this.m_wheel.SetTransformVec(this.m_wheel.GetPosition(), -120.0 * b2.pi / 180.0);
                    this.CreateLeg(-1.0, wheelAnchor);
                    this.CreateLeg(1.0, wheelAnchor);
                }
                Keyboard(key) {
                    switch (key) {
                        case "a":
                            this.m_motorJoint.SetMotorSpeed(-this.m_motorSpeed);
                            break;
                        case "s":
                            this.m_motorJoint.SetMotorSpeed(0.0);
                            break;
                        case "d":
                            this.m_motorJoint.SetMotorSpeed(this.m_motorSpeed);
                            break;
                        case "m":
                            this.m_motorJoint.EnableMotor(!this.m_motorJoint.IsMotorEnabled());
                            break;
                    }
                }
                Step(settings) {
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Keys: left = a, brake = s, right = d, toggle motor = m");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    super.Step(settings);
                }
                static Create() {
                    return new TheoJansen();
                }
            };
            exports_1("TheoJansen", TheoJansen);
            exports_1("testIndex", testIndex = testbed.RegisterTest("Examples", "Theo Jansen", TheoJansen.Create));
        }
    };
});
//# sourceMappingURL=theo_jansen.js.map