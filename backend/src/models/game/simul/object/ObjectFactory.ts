import * as Box2D from '../../Box2D'
import { BallDef, GroundDef, ItemDef, ObjectDefBase, PaddleDef } from './ObjectDef'

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
  
  public createPaddle(world : Box2D.World, x: number, y:number){
    const paddleDef : PaddleDef = new PaddleDef(x,y);
    world.CreateBody(
      paddleDef.objectBodyDef
    ).CreateFixture(
      paddleDef.objectFixtureDef
    );
  }
  public createItem(world : Box2D.World){
    const itemDef : ItemDef = new ItemDef()
    world.CreateBody(
      itemDef.objectBodyDef
    ).CreateFixture(
      itemDef.objectFixtureDef
    );
  }
}