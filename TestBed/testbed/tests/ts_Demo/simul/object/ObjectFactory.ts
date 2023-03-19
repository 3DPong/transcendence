import * as Box2D from "@box2d";
import { BallDef, GroundDef, ItemDef, PaddleDef } from "./ObjectDef.js";

export class ObjectFactory {

  public createBall(world : Box2D.World) : Box2D.Body {
    const ballDef : BallDef = new BallDef();
    const ball : Box2D.Body = world.CreateBody(ballDef.objectBodyDef);
    ball.CreateFixture(ballDef.objectFixtureDef);

    return ball;
  }

  public createGround(world : Box2D.World){
    const groundDef : GroundDef = new GroundDef();
    world.CreateBody(
      groundDef.objectBodyDef
    ).CreateFixture(
      groundDef.objectFixtureDef
    );
  }
  
  public createPaddle(
    world : Box2D.World, x: number, y:number
  ) : Box2D.Body {
    const paddleDef : PaddleDef = new PaddleDef(x,y);
    const paddle : Box2D.Body = world.CreateBody(paddleDef.objectBodyDef);
    paddle.CreateFixture(paddleDef.objectFixtureDef);
    return paddle;
  }
  
  public createItem(world : Box2D.World) : Box2D.Body {
    const itemDef : ItemDef = new ItemDef()
    const item : Box2D.Body = world.CreateBody(itemDef.objectBodyDef);
    item.CreateFixture(itemDef.objectFixtureDef);
    return item;
  }
}