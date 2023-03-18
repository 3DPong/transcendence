import * as Box2D from '../Box2D'
import { ObjectFactory } from './object/ObjectFactory';

export class GameSimulator {


  constructor (
    private world : Box2D.World,
    private objectFactory : ObjectFactory,
  ) {
    this.world = new Box2D.World(new Box2D.Vec2());
    //ball create & add to world
    objectFactory.createBall(world);
    
  }
}