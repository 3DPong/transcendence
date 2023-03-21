import * as Box2D from "@box2d";
import * as testbed from "@testbed";
import { MAP_HEIGHT, MAP_WIDTH} from "../gameEnv/GameEnv.js";
import { ObjectFactory } from "./object/ObjectFactory.js";


function BallSpeedCorrection(ball : Box2D.Body){
  const afterVelocity : number = 6000;
  const beforeVelocity : number = ball.GetLinearVelocity().LengthSquared();
  const vel : Box2D.Vec2 = ball.GetLinearVelocity().Clone();
  const coefficient : number = Math.sqrt(afterVelocity/ beforeVelocity);
  ball.SetLinearVelocity(new Box2D.Vec2(vel.x * coefficient, vel.y * coefficient));
}

function ContactListenerInit(world: Box2D.World){
  //  world.GetContactManager().m_contactListener.BeginContact = ()=>{};
  //  world.GetContactManager().m_contactListener.EndContact = ()=>{};
    //충돌 직전 콜 되는 이벤트, score확인
    world.GetContactManager(
    ).m_contactListener.PreSolve = function(
      contact: Box2D.Contact, oldManifold: Box2D.Manifold
    ): void {
      const Ashape : Box2D.Fixture = contact.GetFixtureA();
      const Bshape : Box2D.Fixture = contact.GetFixtureB();
      const ball : Box2D.Body = Ashape.GetUserData() === "ball" ? Ashape.GetBody() : Bshape.GetBody();
      const newManifold : Box2D.Manifold = contact.GetManifold();
      if (newManifold.localPoint.x === MAP_WIDTH && newManifold.localPoint.y === MAP_HEIGHT){
        ++ball.GetUserData().player1_score;
        ball.GetUserData().pause = true;
        //ball init
      } else if (newManifold.localPoint.x === -MAP_WIDTH && newManifold.localPoint.y === -MAP_HEIGHT){
        ++ball.GetUserData().player2_score;
        ball.GetUserData().pause = true;
        //ball init
      }
    }

    //충돌후 콜 되는 이벤트, 공 속도보정
    world.GetContactManager(    
    ).m_contactListener.PostSolve = function(
      contact: Box2D.Contact, impulse: Box2D.ContactImpulse
    ): void {
      const Ashape : Box2D.Fixture = contact.GetFixtureA();
      const Bshape : Box2D.Fixture = contact.GetFixtureB();
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


function MovePeddle(paddle : Box2D.Body, paddleState :PaddleState){
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
      this.leftPaddle = this.objectFactory.createPaddle(this.m_world, -43, 0, "player1");//left
      this.rightPaddle =  this.objectFactory.createPaddle(this.m_world, 43, 0, "player2");//right
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
    if (this.ball.GetUserData().pause){
      this.ball.SetPositionXY(0,0);
      this.ball.GetUserData().pause = false;
      //Todo : MatchScore 확인 하고 종료
    }
    //console.log('ball AngularVelocity : ', this.ball.GetAngularVelocity(), 'ball Velocity', this.ball.GetLinearVelocity());
    //BallSpeedCorrection(this.ball);
    if (this.leftButton !== PaddleState.STOP){
      MovePeddle(this.leftPaddle, this.leftButton);
    } else if (this.rightButton !== PaddleState.STOP) {
      MovePeddle(this.rightPaddle, this.rightButton);
    }
    testbed.g_debugDraw.DrawString(
      5, this.m_textLine, "Keys: (w) p1_up, (s) p1_down, (u) p2_up, (j) p2_down"
    );
    this.m_textLine += 400;
    testbed.g_debugDraw.DrawString(
      800, this.m_textLine, `player1 score : ${this.ball.GetUserData().player1_score}  player2 score : ${this.ball.GetUserData().player2_score}`
    );
    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
  }

  public static Create(): testbed.Test {
    return new GameSimulator();
  }
}

export const testIndex: number = testbed.RegisterTest("PingPong", "demoTest", GameSimulator.Create);