import * as Box2D from '../Box2D'
import { ObjectFactory } from './object/ObjectFactory';
function ContactListenerInit(world: Box2D.World){
//  world.GetContactManager().m_contactListener.BeginContact = ()=>{};
//  world.GetContactManager().m_contactListener.EndContact = ()=>{};
//  world.GetContactManager().m_contactListener.PreSolve = ()=>{};
  world.GetContactManager(    
  ).m_contactListener.PostSolve = function(
    contact: Box2D.Contact, impulse: Box2D.ContactImpulse
  ): void {
    console.log('call contactListener postsolve');
  }
}
export class GameSimulator {

  private world : Box2D.World = new Box2D.World(new Box2D.Vec2());
  private objectFactory : ObjectFactory = new ObjectFactory();
  
  constructor (
  ) {
    //ball create & add to world
    this.objectFactory.createBall(this.world);
    this.objectFactory.createGround(this.world);
    this.objectFactory.createPaddle(this.world, -23, 0);//left
    this.objectFactory.createPaddle(this.world, 23, 0);//right
    ContactListenerInit(this.world);
  }

  public step(timeStepMillis: number = (1 / 60)){
    const velocityIterations = 6;
    const positionIterations = 2;
    this.world.Step(timeStepMillis,velocityIterations,positionIterations);
  }
}