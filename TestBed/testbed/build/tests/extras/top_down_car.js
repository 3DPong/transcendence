/*
 * Author: Chris Campbell - www.iforce2d.net
 *
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
    var b2, testbed, DEGTORAD, TDC_LEFT, TDC_RIGHT, TDC_UP, TDC_DOWN, FUD_CAR_TIRE, FUD_GROUND_AREA, FixtureUserData, CarTireFUD, GroundAreaFUD, TDTire, TDCar, MyDestructionListener, TopdownCar, testIndex;
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
            DEGTORAD = 0.0174532925199432957;
            // const RADTODEG = 57.295779513082320876;
            TDC_LEFT = 0x1;
            TDC_RIGHT = 0x2;
            TDC_UP = 0x4;
            TDC_DOWN = 0x8;
            /**
             * types of fixture user data
             */
            FUD_CAR_TIRE = 0;
            FUD_GROUND_AREA = 1;
            /**
             * a class to allow subclassing of different fixture user data
             */
            FixtureUserData = class FixtureUserData {
                constructor(type) {
                    this.m_type = type;
                }
                getType() {
                    return this.m_type;
                }
            };
            exports_1("FixtureUserData", FixtureUserData);
            /**
             * class to allow marking a fixture as a car tire
             */
            CarTireFUD = class CarTireFUD extends FixtureUserData {
                constructor() {
                    super(FUD_CAR_TIRE);
                }
            };
            exports_1("CarTireFUD", CarTireFUD);
            // /**
            //  * class to allow marking a fixture as a ground area
            //  */
            GroundAreaFUD = class GroundAreaFUD extends FixtureUserData {
                constructor(fm, ooc) {
                    super(FUD_GROUND_AREA);
                    this.frictionModifier = fm;
                    this.outOfCourse = ooc;
                }
            };
            exports_1("GroundAreaFUD", GroundAreaFUD);
            TDTire = class TDTire {
                constructor(world) {
                    this.m_groundAreas = [];
                    this.m_currentTraction = 1;
                    this.m_maxForwardSpeed = 0;
                    this.m_maxBackwardSpeed = 0;
                    this.m_maxDriveForce = 0;
                    this.m_maxLateralImpulse = 0;
                    const bodyDef = new b2.BodyDef();
                    bodyDef.type = b2.BodyType.b2_dynamicBody;
                    this.m_body = world.CreateBody(bodyDef);
                    const polygonShape = new b2.PolygonShape();
                    polygonShape.SetAsBox(0.5, 1.25);
                    const fixture = this.m_body.CreateFixture(polygonShape, 1); //shape, density
                    fixture.SetUserData(new CarTireFUD());
                    this.m_body.SetUserData(this);
                }
                setCharacteristics(maxForwardSpeed, maxBackwardSpeed, maxDriveForce, maxLateralImpulse) {
                    this.m_maxForwardSpeed = maxForwardSpeed;
                    this.m_maxBackwardSpeed = maxBackwardSpeed;
                    this.m_maxDriveForce = maxDriveForce;
                    this.m_maxLateralImpulse = maxLateralImpulse;
                }
                addGroundArea(ga) {
                    this.m_groundAreas.push(ga);
                    this.updateTraction();
                }
                removeGroundArea(ga) {
                    this.m_groundAreas.splice(this.m_groundAreas.indexOf(ga));
                    this.updateTraction();
                }
                updateTraction() {
                    if (this.m_groundAreas.length === 0) {
                        this.m_currentTraction = 1;
                    }
                    else {
                        //find area with highest traction
                        this.m_currentTraction = 0;
                        this.m_groundAreas.forEach((ga) => {
                            if (ga.frictionModifier > this.m_currentTraction) {
                                this.m_currentTraction = ga.frictionModifier;
                            }
                        });
                    }
                }
                getLateralVelocity() {
                    const currentRightNormal = this.m_body.GetWorldVector(new b2.Vec2(1, 0), new b2.Vec2());
                    return currentRightNormal.SelfMul(b2.Vec2.DotVV(currentRightNormal, this.m_body.GetLinearVelocity()));
                }
                getForwardVelocity() {
                    const currentForwardNormal = this.m_body.GetWorldVector(new b2.Vec2(0, 1), new b2.Vec2());
                    return currentForwardNormal.SelfMul(b2.Vec2.DotVV(currentForwardNormal, this.m_body.GetLinearVelocity()));
                }
                updateFriction() {
                    //lateral linear velocity
                    const impulse = this.getLateralVelocity().SelfMul(-1.0 * this.m_body.GetMass());
                    if (impulse.Length() > this.m_maxLateralImpulse) {
                        impulse.SelfMul(this.m_maxLateralImpulse / impulse.Length());
                    }
                    this.m_body.ApplyLinearImpulse(impulse.SelfMul(this.m_currentTraction), this.m_body.GetWorldCenter());
                    //angular velocity
                    this.m_body.ApplyAngularImpulse(this.m_currentTraction * 0.1 * this.m_body.GetInertia() * -this.m_body.GetAngularVelocity());
                    //forward linear velocity
                    const currentForwardNormal = this.getForwardVelocity();
                    const currentForwardSpeed = currentForwardNormal.Normalize();
                    const dragForceMagnitude = -2 * currentForwardSpeed;
                    this.m_body.ApplyForce(currentForwardNormal.SelfMul(this.m_currentTraction * dragForceMagnitude), this.m_body.GetWorldCenter());
                }
                updateDrive(controlState) {
                    //find desired speed
                    let desiredSpeed = 0;
                    switch (controlState & (TDC_UP | TDC_DOWN)) {
                        case TDC_UP:
                            desiredSpeed = this.m_maxForwardSpeed;
                            break;
                        case TDC_DOWN:
                            desiredSpeed = this.m_maxBackwardSpeed;
                            break;
                        default:
                            return; //do nothing
                    }
                    //find current speed in forward direction
                    const currentForwardNormal = this.m_body.GetWorldVector(new b2.Vec2(0, 1), new b2.Vec2());
                    const currentSpeed = b2.Vec2.DotVV(this.getForwardVelocity(), currentForwardNormal);
                    //apply necessary force
                    let force = 0;
                    if (desiredSpeed > currentSpeed) {
                        force = this.m_maxDriveForce;
                    }
                    else if (desiredSpeed < currentSpeed) {
                        force = -this.m_maxDriveForce;
                    }
                    else {
                        return;
                    }
                    this.m_body.ApplyForce(currentForwardNormal.SelfMul(this.m_currentTraction * force), this.m_body.GetWorldCenter());
                }
                updateTurn(controlState) {
                    let desiredTorque = 0;
                    switch (controlState & (TDC_LEFT | TDC_RIGHT)) {
                        case TDC_LEFT:
                            desiredTorque = 15;
                            break;
                        case TDC_RIGHT:
                            desiredTorque = -15;
                            break;
                        default:
                        //nothing
                    }
                    this.m_body.ApplyTorque(desiredTorque);
                }
            };
            exports_1("TDTire", TDTire);
            TDCar = class TDCar {
                constructor(world) {
                    this.m_tires = [];
                    //create car body
                    const bodyDef = new b2.BodyDef();
                    bodyDef.type = b2.BodyType.b2_dynamicBody;
                    this.m_body = world.CreateBody(bodyDef);
                    this.m_body.SetAngularDamping(3);
                    const vertices = [];
                    vertices[0] = new b2.Vec2(1.5, 0);
                    vertices[1] = new b2.Vec2(3, 2.5);
                    vertices[2] = new b2.Vec2(2.8, 5.5);
                    vertices[3] = new b2.Vec2(1, 10);
                    vertices[4] = new b2.Vec2(-1, 10);
                    vertices[5] = new b2.Vec2(-2.8, 5.5);
                    vertices[6] = new b2.Vec2(-3, 2.5);
                    vertices[7] = new b2.Vec2(-1.5, 0);
                    const polygonShape = new b2.PolygonShape();
                    polygonShape.Set(vertices, 8);
                    this.m_body.CreateFixture(polygonShape, 0.1); //shape, density
                    //prepare common joint parameters
                    const jointDef = new b2.RevoluteJointDef();
                    jointDef.bodyA = this.m_body;
                    jointDef.enableLimit = true;
                    jointDef.lowerAngle = 0;
                    jointDef.upperAngle = 0;
                    jointDef.localAnchorB.SetZero(); //center of tire
                    const maxForwardSpeed = 250;
                    const maxBackwardSpeed = -40;
                    const backTireMaxDriveForce = 300;
                    const frontTireMaxDriveForce = 500;
                    const backTireMaxLateralImpulse = 8.5;
                    const frontTireMaxLateralImpulse = 7.5;
                    //back left tire
                    let tire = new TDTire(world);
                    tire.setCharacteristics(maxForwardSpeed, maxBackwardSpeed, backTireMaxDriveForce, backTireMaxLateralImpulse);
                    jointDef.bodyB = tire.m_body;
                    jointDef.localAnchorA.Set(-3, 0.75);
                    world.CreateJoint(jointDef);
                    this.m_tires.push(tire);
                    //back right tire
                    tire = new TDTire(world);
                    tire.setCharacteristics(maxForwardSpeed, maxBackwardSpeed, backTireMaxDriveForce, backTireMaxLateralImpulse);
                    jointDef.bodyB = tire.m_body;
                    jointDef.localAnchorA.Set(3, 0.75);
                    world.CreateJoint(jointDef);
                    this.m_tires.push(tire);
                    //front left tire
                    tire = new TDTire(world);
                    tire.setCharacteristics(maxForwardSpeed, maxBackwardSpeed, frontTireMaxDriveForce, frontTireMaxLateralImpulse);
                    jointDef.bodyB = tire.m_body;
                    jointDef.localAnchorA.Set(-3, 8.5);
                    this.flJoint = world.CreateJoint(jointDef);
                    this.m_tires.push(tire);
                    //front right tire
                    tire = new TDTire(world);
                    tire.setCharacteristics(maxForwardSpeed, maxBackwardSpeed, frontTireMaxDriveForce, frontTireMaxLateralImpulse);
                    jointDef.bodyB = tire.m_body;
                    jointDef.localAnchorA.Set(3, 8.5);
                    this.frJoint = world.CreateJoint(jointDef);
                    this.m_tires.push(tire);
                }
                update(controlState) {
                    this.m_tires.forEach((tire) => {
                        tire.updateFriction();
                    });
                    this.m_tires.forEach((tire) => {
                        tire.updateDrive(controlState);
                    });
                    //control steering
                    const lockAngle = 35 * DEGTORAD;
                    const turnSpeedPerSec = 160 * DEGTORAD; //from lock to lock in 0.5 sec
                    const turnPerTimeStep = turnSpeedPerSec / 60.0;
                    let desiredAngle = 0;
                    switch (controlState & (TDC_LEFT | TDC_RIGHT)) {
                        case TDC_LEFT:
                            desiredAngle = lockAngle;
                            break;
                        case TDC_RIGHT:
                            desiredAngle = -lockAngle;
                            break;
                        default:
                        //nothing
                    }
                    const angleNow = this.flJoint.GetJointAngle();
                    let angleToTurn = desiredAngle - angleNow;
                    angleToTurn = b2.Clamp(angleToTurn, -turnPerTimeStep, turnPerTimeStep);
                    const newAngle = angleNow + angleToTurn;
                    this.flJoint.SetLimits(newAngle, newAngle);
                    this.frJoint.SetLimits(newAngle, newAngle);
                }
            };
            exports_1("TDCar", TDCar);
            MyDestructionListener = class MyDestructionListener extends testbed.DestructionListener {
                SayGoodbyeFixture(fixture) {
                    ///  if ( FixtureUserData* fud = (FixtureUserData*)fixture.GetUserData() )
                    ///    delete fud;
                    super.SayGoodbyeFixture(fixture);
                }
                /**
                 * (unused but must implement all pure virtual functions)
                 */
                SayGoodbyeJoint(joint) {
                    super.SayGoodbyeJoint(joint);
                }
            };
            exports_1("MyDestructionListener", MyDestructionListener);
            TopdownCar = class TopdownCar extends testbed.Test {
                constructor() {
                    super();
                    //this.m_destructionListener = new MyDestructionListener(this);
                    this.m_world.SetGravity(new b2.Vec2(0.0, 0.0));
                    this.m_world.SetDestructionListener(this.m_destructionListener);
                    //set up ground areas
                    {
                        const bodyDef = new b2.BodyDef();
                        this.m_groundBody = this.m_world.CreateBody(bodyDef);
                        const polygonShape = new b2.PolygonShape();
                        const fixtureDef = new b2.FixtureDef();
                        fixtureDef.shape = polygonShape;
                        fixtureDef.isSensor = true;
                        polygonShape.SetAsBox(9, 7, new b2.Vec2(-10, 15), 20 * DEGTORAD);
                        let groundAreaFixture = this.m_groundBody.CreateFixture(fixtureDef);
                        groundAreaFixture.SetUserData(new GroundAreaFUD(0.5, false));
                        polygonShape.SetAsBox(9, 5, new b2.Vec2(5, 20), -40 * DEGTORAD);
                        groundAreaFixture = this.m_groundBody.CreateFixture(fixtureDef);
                        groundAreaFixture.SetUserData(new GroundAreaFUD(0.2, false));
                    }
                    //this.m_tire = new TDTire(this.m_world);
                    //this.m_tire.setCharacteristics(100, -20, 150);
                    this.m_car = new TDCar(this.m_world);
                    this.m_controlState = 0;
                }
                Keyboard(key) {
                    switch (key) {
                        case "a":
                            this.m_controlState |= TDC_LEFT;
                            break;
                        case "d":
                            this.m_controlState |= TDC_RIGHT;
                            break;
                        case "w":
                            this.m_controlState |= TDC_UP;
                            break;
                        case "s":
                            this.m_controlState |= TDC_DOWN;
                            break;
                        default:
                            super.Keyboard(key);
                    }
                }
                KeyboardUp(key) {
                    switch (key) {
                        case "a":
                            this.m_controlState &= ~TDC_LEFT;
                            break;
                        case "d":
                            this.m_controlState &= ~TDC_RIGHT;
                            break;
                        case "w":
                            this.m_controlState &= ~TDC_UP;
                            break;
                        case "s":
                            this.m_controlState &= ~TDC_DOWN;
                            break;
                        default:
                            super.KeyboardUp(key);
                    }
                }
                static handleContact(contact, began) {
                    const a = contact.GetFixtureA();
                    const b = contact.GetFixtureB();
                    const fudA = a.GetUserData();
                    const fudB = b.GetUserData();
                    if (!fudA || !fudB) {
                        return;
                    }
                    if (fudA.getType() === FUD_CAR_TIRE || fudB.getType() === FUD_GROUND_AREA) {
                        TopdownCar.tire_vs_groundArea(a, b, began);
                    }
                    else if (fudA.getType() === FUD_GROUND_AREA || fudB.getType() === FUD_CAR_TIRE) {
                        TopdownCar.tire_vs_groundArea(b, a, began);
                    }
                }
                BeginContact(contact) {
                    TopdownCar.handleContact(contact, true);
                }
                EndContact(contact) {
                    TopdownCar.handleContact(contact, false);
                }
                static tire_vs_groundArea(tireFixture, groundAreaFixture, began) {
                    const tire = tireFixture.GetBody().GetUserData();
                    const gaFud = groundAreaFixture.GetUserData();
                    if (began) {
                        tire.addGroundArea(gaFud);
                    }
                    else {
                        tire.removeGroundArea(gaFud);
                    }
                }
                Step(settings) {
                    /*this.m_tire.updateFriction();
                    this.m_tire.updateDrive(this.m_controlState);
                    this.m_tire.updateTurn(this.m_controlState);*/
                    this.m_car.update(this.m_controlState);
                    super.Step(settings);
                    //show some useful info
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Press w/a/s/d to control the car");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                    //testbed.g_debugDraw.DrawString(5, this.m_textLine, "Tire traction: %.2f", this.m_tire.m_currentTraction);
                    //this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                static Create() {
                    return new TopdownCar();
                }
            };
            exports_1("TopdownCar", TopdownCar);
            exports_1("testIndex", testIndex = testbed.RegisterTest("Extras", "Topdown Car", TopdownCar.Create));
        }
    };
});
//# sourceMappingURL=top_down_car.js.map