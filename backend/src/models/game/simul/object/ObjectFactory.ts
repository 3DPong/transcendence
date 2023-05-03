import * as Box2D from '../../Box2D';
import { BallDef, GroundDef, ItemDef, PaddleDef, PinDef, RectangleDef } from './ObjectDef.js';

export class ObjectFactory {
  public createBall(world: Box2D.World): Box2D.Body {
    const ballDef: BallDef = new BallDef();
    const ball: Box2D.Body = world.CreateBody(ballDef.objectBodyDef);
    ball.CreateFixture(ballDef.objectFixtureDef);

    return ball;
  }

  public createGround(world: Box2D.World) {
    const groundDef: GroundDef = new GroundDef();
    world.CreateBody(groundDef.objectBodyDef).CreateFixture(groundDef.objectFixtureDef);
  }

  public createPaddle(world: Box2D.World, x: number, y: number, id: string): Box2D.Body {
    const paddleDef: PaddleDef = new PaddleDef(x, y, id);
    const paddle: Box2D.Body = world.CreateBody(paddleDef.objectBodyDef);
    paddle.CreateFixture(paddleDef.objectFixtureDef);
    return paddle;
  }

  public createItem(world: Box2D.World): Box2D.Body {
    const itemDef: ItemDef = new ItemDef();
    const item: Box2D.Body = world.CreateBody(itemDef.objectBodyDef);
    item.CreateFixture(itemDef.objectFixtureDef);
    return item;
  }

  public createObstacle(world: Box2D.World) {
    const pindef1: PinDef = new PinDef(0, 10);
    const pin1: Box2D.Body = world.CreateBody(pindef1.objectBodyDef);
    pin1.CreateFixture(pindef1.objectFixtureDef);

    const rectangleDef1: RectangleDef = new RectangleDef(0, 16);
    const rect1: Box2D.Body = world.CreateBody(rectangleDef1.objectBodyDef);
    rect1.SetLinearVelocity(new Box2D.Vec2(100, 80));
    rect1.CreateFixture(rectangleDef1.objectFixtureDef);

    const jd1 = new Box2D.DistanceJointDef();
    jd1.Initialize(pin1, rect1, pin1.GetPosition(), rect1.GetPosition());
    jd1.collideConnected = true;
    world.CreateJoint(jd1);

    const pindef2: PinDef = new PinDef(0, -10);

    const pin2: Box2D.Body = world.CreateBody(pindef2.objectBodyDef);
    pin2.CreateFixture(pindef2.objectFixtureDef);

    const rectangleDef2: RectangleDef = new RectangleDef(0, -16);
    const rect2: Box2D.Body = world.CreateBody(rectangleDef2.objectBodyDef);
    rect2.CreateFixture(rectangleDef2.objectFixtureDef);
    rect2.SetLinearVelocity(new Box2D.Vec2(-100, -80));
    const jd2 = new Box2D.DistanceJointDef();
    jd2.Initialize(pin2, rect2, pin2.GetPosition(), rect2.GetPosition());
    jd2.collideConnected = true;
    world.CreateJoint(jd2);
  }
}
