/*
* Copyright (c) 2006-2012 Erin Catto http://www.box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/
System.register(["@box2d", "@testbed"], function (exports_1, context_1) {
    "use strict";
    var b2, testbed, BuoyancyTest, testIndex;
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
            BuoyancyTest = class BuoyancyTest extends testbed.Test {
                constructor() {
                    super();
                    this.m_bodies = new Array();
                    const bc = new b2.BuoyancyController();
                    this.m_controller = bc;
                    bc.normal.Set(0.0, 1.0);
                    bc.offset = 20.0;
                    bc.density = 2.0;
                    bc.linearDrag = 5.0;
                    bc.angularDrag = 2.0;
                    const ground = this.m_world.CreateBody(new b2.BodyDef());
                    {
                        const shape = new b2.EdgeShape();
                        shape.SetTwoSided(new b2.Vec2(-40.0, 0.0), new b2.Vec2(40.0, 0.0));
                        ground.CreateFixture(shape, 0.0);
                        shape.SetTwoSided(new b2.Vec2(-40.0, 0.0), new b2.Vec2(-40.0, 25.0));
                        ground.CreateFixture(shape, 0.0);
                        shape.SetTwoSided(new b2.Vec2(40.0, 0.0), new b2.Vec2(40.0, 25.0));
                        ground.CreateFixture(shape, 0.0);
                    }
                    // Spawn in a bunch of crap
                    {
                        for (let i = 0; i < 5; i++) {
                            const bd = new b2.BodyDef();
                            bd.type = b2.BodyType.b2_dynamicBody;
                            //bd.isBullet = true;
                            bd.position.Set(Math.random() * 40.0 - 20.0, Math.random() * 15.0 + 5.0);
                            bd.angle = Math.random() * Math.PI;
                            const body = this.m_world.CreateBody(bd);
                            const fd = new b2.FixtureDef();
                            fd.density = 1.0;
                            // Override the default friction.
                            fd.friction = 0.3;
                            fd.restitution = 0.1;
                            const polygon = new b2.PolygonShape();
                            fd.shape = polygon;
                            polygon.SetAsBox(Math.random() * 0.5 + 1.0, Math.random() * 0.5 + 1.0);
                            body.CreateFixture(fd);
                            this.m_bodies.push(body);
                        }
                    }
                    {
                        for (let i = 0; i < 5; i++) {
                            const bd = new b2.BodyDef();
                            bd.type = b2.BodyType.b2_dynamicBody;
                            //bd.isBullet = true;
                            bd.position.Set(Math.random() * 40.0 - 20.0, Math.random() * 15.0 + 5.0);
                            bd.angle = Math.random() * Math.PI;
                            const body = this.m_world.CreateBody(bd);
                            const fd = new b2.FixtureDef();
                            fd.density = 1.0;
                            // Override the default friction.
                            fd.friction = 0.3;
                            fd.restitution = 0.1;
                            fd.shape = new b2.CircleShape(Math.random() * 0.5 + 1.0);
                            body.CreateFixture(fd);
                            this.m_bodies.push(body);
                        }
                    }
                    {
                        for (let i = 0; i < 15; i++) {
                            const bd = new b2.BodyDef();
                            bd.type = b2.BodyType.b2_dynamicBody;
                            //bd.isBullet = true;
                            bd.position.Set(Math.random() * 40.0 - 20.0, Math.random() * 15.0 + 5.0);
                            bd.angle = Math.random() * Math.PI;
                            const body = this.m_world.CreateBody(bd);
                            const fd = new b2.FixtureDef();
                            fd.density = 1.0;
                            fd.friction = 0.3;
                            fd.restitution = 0.1;
                            const polygon = new b2.PolygonShape();
                            fd.shape = polygon;
                            if (Math.random() > 0.66) {
                                polygon.Set([
                                    new b2.Vec2(-1.0 - Math.random() * 1.0, 1.0 + Math.random() * 1.0),
                                    new b2.Vec2(-0.5 - Math.random() * 1.0, -1.0 - Math.random() * 1.0),
                                    new b2.Vec2(0.5 + Math.random() * 1.0, -1.0 - Math.random() * 1.0),
                                    new b2.Vec2(1.0 + Math.random() * 1.0, 1.0 + Math.random() * 1.0),
                                ]);
                            }
                            else if (Math.random() > 0.5) {
                                const array = [];
                                array[0] = new b2.Vec2(0.0, 1.0 + Math.random() * 1.0);
                                array[2] = new b2.Vec2(-0.5 - Math.random() * 1.0, -1.0 - Math.random() * 1.0);
                                array[3] = new b2.Vec2(0.5 + Math.random() * 1.0, -1.0 - Math.random() * 1.0);
                                array[1] = new b2.Vec2((array[0].x + array[2].x), (array[0].y + array[2].y));
                                array[1].SelfMul(Math.random() / 2 + 0.8);
                                array[4] = new b2.Vec2((array[3].x + array[0].x), (array[3].y + array[0].y));
                                array[4].SelfMul(Math.random() / 2 + 0.8);
                                polygon.Set(array);
                            }
                            else {
                                polygon.Set([
                                    new b2.Vec2(0.0, 1.0 + Math.random() * 1.0),
                                    new b2.Vec2(-0.5 - Math.random() * 1.0, -1.0 - Math.random() * 1.0),
                                    new b2.Vec2(0.5 + Math.random() * 1.0, -1.0 - Math.random() * 1.0),
                                ]);
                            }
                            body.CreateFixture(fd);
                            this.m_bodies.push(body);
                        }
                    }
                    //Add some exciting bath toys
                    {
                        const bd = new b2.BodyDef();
                        bd.type = b2.BodyType.b2_dynamicBody;
                        bd.position.Set(0.0, 40.0);
                        bd.angle = 0;
                        const body = this.m_world.CreateBody(bd);
                        const fd = new b2.FixtureDef();
                        fd.density = 3.0;
                        const polygon = new b2.PolygonShape();
                        fd.shape = polygon;
                        polygon.SetAsBox(4.0, 1.0);
                        body.CreateFixture(fd);
                        this.m_bodies.push(body);
                    }
                    {
                        const bd = new b2.BodyDef();
                        bd.type = b2.BodyType.b2_dynamicBody;
                        bd.position.Set(0.0, 30.0);
                        const body = this.m_world.CreateBody(bd);
                        const fd = new b2.FixtureDef();
                        fd.density = 2.0;
                        const circle = new b2.CircleShape(0.7);
                        fd.shape = circle;
                        circle.m_p.Set(3.0, 0.0);
                        body.CreateFixture(fd);
                        circle.m_p.Set(-3.0, 0.0);
                        body.CreateFixture(fd);
                        circle.m_p.Set(0.0, 3.0);
                        body.CreateFixture(fd);
                        circle.m_p.Set(0.0, -3.0);
                        body.CreateFixture(fd);
                        fd.density = 2.0;
                        const polygon = new b2.PolygonShape();
                        fd.shape = polygon;
                        polygon.SetAsBox(3.0, 0.2);
                        body.CreateFixture(fd);
                        polygon.SetAsBox(0.2, 3.0);
                        body.CreateFixture(fd);
                        this.m_bodies.push(body);
                    }
                    // if (b2.DEBUG) {
                    //   for (let body_i = 0; i < this.m_bodies.length; ++i)
                    //     this.m_controller.AddBody(this.m_bodies[body_i]);
                    //   for (let body_i = 0; i < this.m_bodies.length; ++i)
                    //     this.m_controller.RemoveBody(this.m_bodies[body_i]);
                    // }
                    for (let body_i = 0; body_i < this.m_bodies.length; ++body_i) {
                        this.m_controller.AddBody(this.m_bodies[body_i]);
                    }
                    // if (b2.DEBUG) {
                    //   this.m_world.AddController(this.m_controller);
                    //   this.m_world.RemoveController(this.m_controller);
                    // }
                    this.m_world.AddController(this.m_controller);
                }
                Step(settings) {
                    super.Step(settings);
                }
                static Create() {
                    return new BuoyancyTest();
                }
            };
            exports_1("BuoyancyTest", BuoyancyTest);
            exports_1("testIndex", testIndex = testbed.RegisterTest("Extras", "Buoyancy Test", BuoyancyTest.Create));
        }
    };
});
//# sourceMappingURL=buoyancy_test.js.map