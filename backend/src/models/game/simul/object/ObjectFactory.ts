import * as Box2D from '../../Box2D'
import { BallDef, GroundDef } from './ObjectDef'

export class ObjectFactory {

  public createBall(world : Box2D.World){
    const ballDef : BallDef = new BallDef();
    world.CreateBody(
      ballDef.objectBodyDef
    ).CreateFixture(
      ballDef.objectFixtureDef
    );
  }

  public createGround(world : Box2D.World){
    const groundDef : GroundDef = new GroundDef();
    world.CreateBody(
      groundDef.objectBodyDef
    ).CreateFixture(
      groundDef.objectFixtureDef
    );
  }
  
  public createPaddle(){}
}