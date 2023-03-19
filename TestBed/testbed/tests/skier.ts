/*
Test case for collision/jerking issue.
*/

import * as b2 from "@box2d";
import * as testbed from "@testbed";

export class Skier extends testbed.Test {
  public m_platform_width: number;
  public m_skier: b2.Body;
  public m_fixed_camera: boolean;

  constructor() {
    super();

    const ground = this.m_world.CreateBody();

    const PlatformWidth = 8.0;

    /*
    First angle is from the horizontal and should be negative for a downward slope.
    Second angle is relative to the preceding slope, and should be positive, creating a kind of
    loose 'Z'-shape from the 3 edges.
    If A1 = -10, then A2 <= ~1.5 will result in the collision glitch.
    If A1 = -30, then A2 <= ~10.0 will result in the glitch.
    */
    const Angle1Degrees = -30.0;
    const Angle2Degrees = 10.0;

    /*
    The larger the value of SlopeLength, the less likely the glitch will show up.
    */
    const SlopeLength = 2.0;

    const SurfaceFriction = 0.2;

    // Convert to radians
    const Slope1Incline = -Angle1Degrees * b2.pi / 180.0;
    const Slope2Incline = Slope1Incline - Angle2Degrees * b2.pi / 180.0;
    //

    this.m_platform_width = PlatformWidth;

    // Horizontal platform
    const v1: b2.Vec2 = new b2.Vec2(-PlatformWidth, 0.0);
    const v2: b2.Vec2 = new b2.Vec2(0.0, 0.0);
    const v3: b2.Vec2 = new b2.Vec2(SlopeLength * Math.cos(Slope1Incline), -SlopeLength * Math.sin(Slope1Incline));
    const v4: b2.Vec2 = new b2.Vec2(v3.x + SlopeLength * Math.cos(Slope2Incline), v3.y - SlopeLength * Math.sin(Slope2Incline));
    const v5: b2.Vec2 = new b2.Vec2(v4.x, v4.y - 1.0);

    const vertices: b2.Vec2[] = [ v5, v4, v3, v2, v1 ];

    const shape = new b2.ChainShape();
    shape.CreateLoop(vertices);
    const fd = new b2.FixtureDef();
    fd.shape = shape;
    fd.density = 0.0;
    fd.friction = SurfaceFriction;

    ground.CreateFixture(fd);

    {
      // const BodyWidth = 1.0;
      const BodyHeight = 2.5;
      const SkiLength = 3.0;

      /*
      Larger values for this seem to alleviate the issue to some extent.
      */
      const SkiThickness = 0.3;

      const SkiFriction = 0.0;
      const SkiRestitution = 0.15;

      const bd = new b2.BodyDef();
      bd.type = b2.BodyType.b2_dynamicBody;

      const initial_y = BodyHeight / 2 + SkiThickness;
      bd.position.Set(-this.m_platform_width / 2, initial_y);

      const skier = this.m_world.CreateBody(bd);

      const ski = new b2.PolygonShape();
      const verts: b2.Vec2[] = [];
      verts.push(new b2.Vec2(-SkiLength / 2 - SkiThickness, -BodyHeight / 2));
      verts.push(new b2.Vec2(-SkiLength / 2, -BodyHeight / 2 - SkiThickness));
      verts.push(new b2.Vec2(SkiLength / 2, -BodyHeight / 2 - SkiThickness));
      verts.push(new b2.Vec2(SkiLength / 2 + SkiThickness, -BodyHeight / 2));
      ski.Set(verts);

      const fd = new b2.FixtureDef();
      fd.density = 1.0;

      fd.friction = SkiFriction;
      fd.restitution = SkiRestitution;

      fd.shape = ski;
      skier.CreateFixture(fd);

      skier.SetLinearVelocity(new b2.Vec2(0.5, 0.0));

      this.m_skier = skier;
    }

    testbed.g_camera.m_center.Set(this.m_platform_width / 2.0, 0.0);
    testbed.g_camera.m_center.Set(this.m_platform_width / 2.0, 0.0);
    testbed.g_camera.m_zoom = 0.4;
    this.m_fixed_camera = true;
  }

  public Keyboard(key: string): void {
    switch (key) {
    case "c":
      this.m_fixed_camera = !this.m_fixed_camera;
      if (this.m_fixed_camera) {
        testbed.g_camera.m_center.Set(this.m_platform_width / 2.0, 0.0);
      }
      break;
    }
  }

  public Step(settings: testbed.Settings): void {
    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Keys: c = Camera fixed/tracking");
    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;

    if (!this.m_fixed_camera) {
      testbed.g_camera.m_center.Copy(this.m_skier.GetPosition());
    }
    super.Step(settings);
  }

  public static Create(): testbed.Test {
    return new Skier();
  }
}

export const testIndex: number = testbed.RegisterTest("Bugs", "Skier", Skier.Create);
