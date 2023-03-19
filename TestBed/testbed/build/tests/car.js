// MIT License
System.register(["@box2d", "@testbed"], function (exports_1, context_1) {
    "use strict";
    var b2, testbed, Car, testIndex;
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
            // This is a fun demo that shows off the wheel joint
            Car = class Car extends testbed.Test {
                constructor() {
                    super();
                    this.m_speed = 0.0;
                    this.m_speed = 50.0;
                    let ground;
                    {
                        const bd = new b2.BodyDef();
                        ground = this.m_world.CreateBody(bd);
                        const shape = new b2.EdgeShape();
                        const fd = new b2.FixtureDef();
                        fd.shape = shape;
                        fd.density = 0.0;
                        fd.friction = 0.6;
                        shape.SetTwoSided(new b2.Vec2(-20.0, 0.0), new b2.Vec2(20.0, 0.0));
                        ground.CreateFixture(fd);
                        const hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];
                        let x = 20.0, y1 = 0.0;
                        const dx = 5.0;
                        for (let i = 0; i < 10; ++i) {
                            const y2 = hs[i];
                            shape.SetTwoSided(new b2.Vec2(x, y1), new b2.Vec2(x + dx, y2));
                            ground.CreateFixture(fd);
                            y1 = y2;
                            x += dx;
                        }
                        for (let i = 0; i < 10; ++i) {
                            const y2 = hs[i];
                            shape.SetTwoSided(new b2.Vec2(x, y1), new b2.Vec2(x + dx, y2));
                            ground.CreateFixture(fd);
                            y1 = y2;
                            x += dx;
                        }
                        shape.SetTwoSided(new b2.Vec2(x, 0.0), new b2.Vec2(x + 40.0, 0.0));
                        ground.CreateFixture(fd);
                        x += 80.0;
                        shape.SetTwoSided(new b2.Vec2(x, 0.0), new b2.Vec2(x + 40.0, 0.0));
                        ground.CreateFixture(fd);
                        x += 40.0;
                        shape.SetTwoSided(new b2.Vec2(x, 0.0), new b2.Vec2(x + 10.0, 5.0));
                        ground.CreateFixture(fd);
                        x += 20.0;
                        shape.SetTwoSided(new b2.Vec2(x, 0.0), new b2.Vec2(x + 40.0, 0.0));
                        ground.CreateFixture(fd);
                        x += 40.0;
                        shape.SetTwoSided(new b2.Vec2(x, 0.0), new b2.Vec2(x, 20.0));
                        ground.CreateFixture(fd);
                    }
                    // Teeter
                    {
                        const bd = new b2.BodyDef();
                        bd.position.Set(140.0, 1.0);
                        bd.type = b2.BodyType.b2_dynamicBody;
                        const body = this.m_world.CreateBody(bd);
                        const box = new b2.PolygonShape();
                        box.SetAsBox(10.0, 0.25);
                        body.CreateFixture(box, 1.0);
                        const jd = new b2.RevoluteJointDef();
                        jd.Initialize(ground, body, body.GetPosition());
                        jd.lowerAngle = -8.0 * b2.pi / 180.0;
                        jd.upperAngle = 8.0 * b2.pi / 180.0;
                        jd.enableLimit = true;
                        this.m_world.CreateJoint(jd);
                        body.ApplyAngularImpulse(100.0);
                    }
                    // Bridge
                    {
                        const N = 20;
                        const shape = new b2.PolygonShape();
                        shape.SetAsBox(1.0, 0.125);
                        const fd = new b2.FixtureDef();
                        fd.shape = shape;
                        fd.density = 1.0;
                        fd.friction = 0.6;
                        const jd = new b2.RevoluteJointDef();
                        let prevBody = ground;
                        for (let i = 0; i < N; ++i) {
                            const bd = new b2.BodyDef();
                            bd.type = b2.BodyType.b2_dynamicBody;
                            bd.position.Set(161.0 + 2.0 * i, -0.125);
                            const body = this.m_world.CreateBody(bd);
                            body.CreateFixture(fd);
                            const anchor = new b2.Vec2(160.0 + 2.0 * i, -0.125);
                            jd.Initialize(prevBody, body, anchor);
                            this.m_world.CreateJoint(jd);
                            prevBody = body;
                        }
                        const anchor = new b2.Vec2(160.0 + 2.0 * N, -0.125);
                        jd.Initialize(prevBody, ground, anchor);
                        this.m_world.CreateJoint(jd);
                    }
                    // Boxes
                    {
                        const box = new b2.PolygonShape();
                        box.SetAsBox(0.5, 0.5);
                        let body;
                        const bd = new b2.BodyDef();
                        bd.type = b2.BodyType.b2_dynamicBody;
                        bd.position.Set(230.0, 0.5);
                        body = this.m_world.CreateBody(bd);
                        body.CreateFixture(box, 0.5);
                        bd.position.Set(230.0, 1.5);
                        body = this.m_world.CreateBody(bd);
                        body.CreateFixture(box, 0.5);
                        bd.position.Set(230.0, 2.5);
                        body = this.m_world.CreateBody(bd);
                        body.CreateFixture(box, 0.5);
                        bd.position.Set(230.0, 3.5);
                        body = this.m_world.CreateBody(bd);
                        body.CreateFixture(box, 0.5);
                        bd.position.Set(230.0, 4.5);
                        body = this.m_world.CreateBody(bd);
                        body.CreateFixture(box, 0.5);
                    }
                    // Car
                    {
                        const chassis = new b2.PolygonShape();
                        const vertices = b2.Vec2.MakeArray(8);
                        vertices[0].Set(-1.5, -0.5);
                        vertices[1].Set(1.5, -0.5);
                        vertices[2].Set(1.5, 0.0);
                        vertices[3].Set(0.0, 0.9);
                        vertices[4].Set(-1.15, 0.9);
                        vertices[5].Set(-1.5, 0.2);
                        chassis.Set(vertices, 6);
                        const circle = new b2.CircleShape();
                        circle.m_radius = 0.4;
                        const bd = new b2.BodyDef();
                        bd.type = b2.BodyType.b2_dynamicBody;
                        bd.position.Set(0.0, 1.0);
                        this.m_car = this.m_world.CreateBody(bd);
                        this.m_car.CreateFixture(chassis, 1.0);
                        const fd = new b2.FixtureDef();
                        fd.shape = circle;
                        fd.density = 1.0;
                        fd.friction = 0.9;
                        bd.position.Set(-1.0, 0.35);
                        this.m_wheel1 = this.m_world.CreateBody(bd);
                        this.m_wheel1.CreateFixture(fd);
                        bd.position.Set(1.0, 0.4);
                        this.m_wheel2 = this.m_world.CreateBody(bd);
                        this.m_wheel2.CreateFixture(fd);
                        const jd = new b2.WheelJointDef();
                        const axis = new b2.Vec2(0.0, 1.0);
                        const mass1 = this.m_wheel1.GetMass();
                        const mass2 = this.m_wheel2.GetMass();
                        const hertz = 4.0;
                        const dampingRatio = 0.7;
                        const omega = 2.0 * b2.pi * hertz;
                        jd.Initialize(this.m_car, this.m_wheel1, this.m_wheel1.GetPosition(), axis);
                        jd.motorSpeed = 0.0;
                        jd.maxMotorTorque = 20.0;
                        jd.enableMotor = true;
                        jd.stiffness = mass1 * omega * omega;
                        jd.damping = 2.0 * mass1 * dampingRatio * omega;
                        jd.lowerTranslation = -0.25;
                        jd.upperTranslation = 0.25;
                        jd.enableLimit = true;
                        this.m_spring1 = this.m_world.CreateJoint(jd);
                        jd.Initialize(this.m_car, this.m_wheel2, this.m_wheel2.GetPosition(), axis);
                        jd.motorSpeed = 0.0;
                        jd.maxMotorTorque = 10.0;
                        jd.enableMotor = false;
                        jd.stiffness = mass2 * omega * omega;
                        jd.damping = 2.0 * mass2 * dampingRatio * omega;
                        jd.lowerTranslation = -0.25;
                        jd.upperTranslation = 0.25;
                        jd.enableLimit = true;
                        this.m_spring2 = this.m_world.CreateJoint(jd);
                    }
                }
                Keyboard(key) {
                    switch (key) {
                        case "a":
                            this.m_spring1.SetMotorSpeed(this.m_speed);
                            break;
                        case "s":
                            this.m_spring1.SetMotorSpeed(0.0);
                            break;
                        case "d":
                            this.m_spring1.SetMotorSpeed(-this.m_speed);
                            break;
                    }
                }
                Step(settings) {
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Keys: left = a, brake = s, right = d, hz down = q, hz up = e");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    testbed.g_camera.m_center.x = this.m_car.GetPosition().x;
                    super.Step(settings);
                }
                static Create() {
                    return new Car();
                }
            };
            exports_1("Car", Car);
            exports_1("testIndex", testIndex = testbed.RegisterTest("Examples", "Car", Car.Create));
        }
    };
});
//# sourceMappingURL=car.js.map