import * as Box2D from "@box2d";
import * as testbed from "@testbed";
import { ObjectFactory } from "./object/ObjectFactory.js";

function BallSpeedCorrection(ball : Box2D.Body){
  const afterVelocity : number = 50000;
  const beforeVelocity : number = ball.GetLinearVelocity().LengthSquared();
  const vel : Box2D.Vec2 = ball.GetLinearVelocity().Clone();
  const coefficient : number = Math.sqrt(afterVelocity/ beforeVelocity);
  ball.SetLinearVelocity(new Box2D.Vec2(vel.x * coefficient, vel.y * coefficient));
}

function ContactListenerInit(world: Box2D.World){
  //  world.GetContactManager().m_contactListener.BeginContact = ()=>{};
  //  world.GetContactManager().m_contactListener.EndContact = ()=>{};
  //  world.GetContactManager().m_contactListener.PreSolve = ()=>{};
    world.GetContactManager(    
    ).m_contactListener.PostSolve = function(
      contact: Box2D.Contact, impulse: Box2D.ContactImpulse
    ): void {
      const Ashape : Box2D.Fixture = contact.GetFixtureA();
      const Bshape : Box2D.Fixture = contact.GetFixtureB();
      if (Ashape.GetUserData() !== "ball" && Bshape.GetUserData() !== "ball"){
        return;
      }
      const ball : Box2D.Body = Ashape.GetUserData() === "ball" ? Ashape.GetBody() : Bshape.GetBody();
      BallSpeedCorrection(ball);
      //console.log('call contactListener postsolve');
    }

    
}
export enum PaddleState{
  UP,
  DOWN,
  STOP,
}


function movePeddle(paddle : Box2D.Body, paddleState :PaddleState){
  const pos : Box2D.Vec2 = paddle.GetPosition();
  if (paddleState === PaddleState.UP){
    if (pos.y > 23){
      return;
    }
    paddle.SetPositionXY(pos.x, pos.y + 1);
  } else if (paddleState === PaddleState.DOWN){
    if (pos.y < -23){
      return;
    }
    paddle.SetPositionXY(pos.x, pos.y - 1);
  } else {
    return ;
  }
}

export class GameSimulator extends testbed.Test {
  //public world : Box2D.World = new Box2D.World(new Box2D.Vec2());
  public objectFactory : ObjectFactory = new ObjectFactory();
  private ball : Box2D.Body;
  private leftPaddle : Box2D.Body;
  private rightPaddle : Box2D.Body;
  private leftButton : PaddleState = PaddleState.STOP;
  private rightButton : PaddleState = PaddleState.STOP;
  constructor(){
    super();
      //ball create & add to world
      this.m_world.SetGravity(new Box2D.Vec2(0,0));//무중력
      this.ball = this.objectFactory.createBall(this.m_world);
      this.objectFactory.createGround(this.m_world);
      this.leftPaddle = this.objectFactory.createPaddle(this.m_world, -43, 0);//left
      this.rightPaddle =  this.objectFactory.createPaddle(this.m_world, 43, 0);//right
      this.objectFactory.createObstacle(this.m_world);
      ContactListenerInit(this.m_world);
      //start : ball velocity init
      this.ball.SetLinearVelocity(new Box2D.Vec2(50,40));
  }

  public Keyboard(key: string) {
    switch (key) {
      case 'w':
        this.leftButton = PaddleState.UP;
      break;
      case 's':
        this.leftButton = PaddleState.DOWN;
      break;
      case 'u':
        this.rightButton = PaddleState.UP;
      break;
      case 'j':
        this.rightButton = PaddleState.DOWN;
      break;
    }
  }

  public KeyboardUp(key: string) {
    switch (key) {
      case 'w':
        this.leftButton = PaddleState.STOP;
      break;
      case 's':
        this.leftButton = PaddleState.STOP;
      break;
      case 'u':
        this.rightButton = PaddleState.STOP;
      break;
      case 'j':
        this.rightButton = PaddleState.STOP;
      break;
    }
  }
  public Step(settings: testbed.Settings): void {
    super.Step(settings);
    //console.log('ball AngularVelocity : ', this.ball.GetAngularVelocity(), 'ball Velocity', this.ball.GetLinearVelocity());
    //BallSpeedCorrection(this.ball);
    if (this.leftButton !== PaddleState.STOP){
      movePeddle(this.leftPaddle, this.leftButton);
    } else if (this.rightButton !== PaddleState.STOP) {
      movePeddle(this.rightPaddle, this.rightButton);
    }
    testbed.g_debugDraw.DrawString(
      5, this.m_textLine, "Keys: (w) p1_up, (s) p1_down, (o) p2_up, (l) p2_down"
    );
    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
  }

  public static Create(): testbed.Test {
    return new GameSimulator();
  }
}

export const testIndex: number = testbed.RegisterTest("PingPong", "demoTest", GameSimulator.Create);