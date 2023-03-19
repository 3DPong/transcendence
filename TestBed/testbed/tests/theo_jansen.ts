// MIT License

// Copyright (c) 2019 Erin Catto

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Inspired by a contribution from roman_m
// Dimensions scooped from APE (http://www.cove.org/ape/index.htm)

import * as b2 from "@box2d";
import * as testbed from "@testbed";

export class TheoJansen extends testbed.Test {
  public m_offset = new b2.Vec2();
  public m_chassis!: b2.Body;
  public m_wheel!: b2.Body;
  public m_motorJoint!: b2.RevoluteJoint;
  public m_motorOn = false;
  public m_motorSpeed = 0;

  constructor() {
    super();

    this.Construct();
  }

  public CreateLeg(s: number, wheelAnchor: b2.Vec2) {
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
    } else {
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
      const dampingRatio: number = 0.5;
      const frequencyHz: number = 10.0;

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

  public Construct() {
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

  public Keyboard(key: string) {
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

  public Step(settings: testbed.Settings): void {
    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Keys: left = a, brake = s, right = d, toggle motor = m");
    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;

    super.Step(settings);
  }

  public static Create(): testbed.Test {
    return new TheoJansen();
  }
}

export const testIndex: number = testbed.RegisterTest("Examples", "Theo Jansen", TheoJansen.Create);
