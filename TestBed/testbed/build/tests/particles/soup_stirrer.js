/*
 * Copyright (c) 2014 Google, Inc.
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
System.register(["@box2d", "@testbed", "./soup.js"], function (exports_1, context_1) {
    "use strict";
    var b2, testbed, soup_js_1, SoupStirrer, testIndex;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (b2_1) {
                b2 = b2_1;
            },
            function (testbed_1) {
                testbed = testbed_1;
            },
            function (soup_js_1_1) {
                soup_js_1 = soup_js_1_1;
            }
        ],
        execute: function () {
            SoupStirrer = class SoupStirrer extends soup_js_1.Soup {
                constructor() {
                    super();
                    this.m_joint = null;
                    this.m_oscillationOffset = 0.0;
                    this.m_particleSystem.SetDamping(1.0);
                    // Shape of the stirrer.
                    const shape = new b2.CircleShape();
                    shape.m_p.Set(0, 0.7);
                    shape.m_radius = 0.4;
                    // Create the stirrer.
                    const bd = new b2.BodyDef();
                    bd.type = b2.BodyType.b2_dynamicBody;
                    this.m_stirrer = this.m_world.CreateBody(bd);
                    this.m_stirrer.CreateFixture(shape, 1.0);
                    // Destroy all particles under the stirrer.
                    const xf = new b2.Transform();
                    xf.SetIdentity();
                    this.m_particleSystem.DestroyParticlesInShape(shape, xf);
                    // By default attach the body to a joint to restrict movement.
                    this.CreateJoint();
                }
                CreateJoint() {
                    // DEBUG: b2.Assert(!this.m_joint);
                    // Create a prismatic joint and connect to the ground, and have it
                    // slide along the x axis.
                    // Disconnect the body from this joint to have more fun.
                    const prismaticJointDef = new b2.PrismaticJointDef();
                    prismaticJointDef.bodyA = this.m_groundBody;
                    prismaticJointDef.bodyB = this.m_stirrer;
                    prismaticJointDef.collideConnected = true;
                    prismaticJointDef.localAxisA.Set(1, 0);
                    prismaticJointDef.localAnchorA.Copy(this.m_stirrer.GetPosition());
                    this.m_joint = this.m_world.CreateJoint(prismaticJointDef);
                }
                /**
                 * Enable the joint if it's disabled, disable it if it's
                 * enabled.
                 */
                ToggleJoint() {
                    if (this.m_joint) {
                        this.m_world.DestroyJoint(this.m_joint);
                        this.m_joint = null;
                    }
                    else {
                        this.CreateJoint();
                    }
                }
                /**
                 * Press "t" to enable / disable the joint restricting the
                 * stirrer's movement.
                 */
                Keyboard(key) {
                    switch (key) {
                        case "t":
                            this.ToggleJoint();
                            break;
                        default:
                            super.Keyboard(key);
                            break;
                    }
                }
                /**
                 * Click the soup to toggle between enabling / disabling the
                 * joint.
                 */
                MouseUp(p) {
                    super.MouseUp(p);
                    if (this.InSoup(p)) {
                        this.ToggleJoint();
                    }
                }
                /**
                 * Determine whether a point is in the soup.
                 */
                InSoup(pos) {
                    // The soup dimensions are from the container initialization in the
                    // Soup test.
                    return pos.y > -1.0 && pos.y < 2.0 && pos.x > -3.0 && pos.x < 3.0;
                }
                /**
                 * Apply a force to the stirrer.
                 */
                Step(settings) {
                    // Magnitude of the force applied to the body.
                    const k_forceMagnitude = 10.0;
                    // How often the force vector rotates.
                    const k_forceOscillationPerSecond = 0.2;
                    const k_forceOscillationPeriod = 1.0 / k_forceOscillationPerSecond;
                    // Maximum speed of the body.
                    const k_maxSpeed = 2.0;
                    this.m_oscillationOffset += (1.0 / settings.m_hertz);
                    if (this.m_oscillationOffset > k_forceOscillationPeriod) {
                        this.m_oscillationOffset -= k_forceOscillationPeriod;
                    }
                    // Calculate the force vector.
                    const forceAngle = this.m_oscillationOffset * k_forceOscillationPerSecond * 2.0 * b2.pi;
                    const forceVector = new b2.Vec2(Math.sin(forceAngle), Math.cos(forceAngle)).SelfMul(k_forceMagnitude);
                    // Only apply force to the body when it's within the soup.
                    if (this.InSoup(this.m_stirrer.GetPosition()) &&
                        this.m_stirrer.GetLinearVelocity().Length() < k_maxSpeed) {
                        this.m_stirrer.ApplyForceToCenter(forceVector, true);
                    }
                    super.Step(settings);
                }
                static Create() {
                    return new SoupStirrer();
                }
            };
            exports_1("SoupStirrer", SoupStirrer);
            exports_1("testIndex", testIndex = testbed.RegisterTest("Particles", "Soup Stirrer", SoupStirrer.Create));
        }
    };
});
//# sourceMappingURL=soup_stirrer.js.map