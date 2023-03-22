import * as Box2D from "@box2d";
import * as testbed from "@testbed";
import { MAP_HEIGHT, MAP_WIDTH} from "../gameEnv/GameEnv.js";
import { PaddleState } from "./GameEnum.js";
import { GameUser } from "./GameUser.js";
import { ObjectFactory } from "./object/ObjectFactory.js";


function BallSpeedCorrection(ball : Box2D.Body, speed: number){
  const afterVelocity : number = speed;
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
      BallSpeedCorrection(ball, 5000);
      //console.log('call contactListener postsolve');
    }
}


function MovePeddle(user : GameUser){
  if (user.directionButton === PaddleState.STOP) {
    return;
  }
  const pos : Box2D.Vec2 = user.paddle.GetPosition();
  let dir : PaddleState = user.directionButton;
  if (user.directionReverse){
    dir = user.directionButton === PaddleState.UP ? PaddleState.DOWN : PaddleState.UP;
  }
  if (dir === PaddleState.UP && pos.y <= 23){
    user.paddle.SetPositionXY(pos.x, pos.y + 1);
  } else if (dir === PaddleState.DOWN && pos.y >= -23){
    user.paddle.SetPositionXY(pos.x, pos.y - 1);
  }
}

export class GameSimulator extends testbed.Test {
  //public world : Box2D.World = new Box2D.World(new Box2D.Vec2());
  public objectFactory : ObjectFactory = new ObjectFactory();
  private ball : Box2D.Body;
  private user1: GameUser;
  private user2: GameUser;

  constructor(){
    super();
      //ball create & add to world
      this.m_world.SetGravity(new Box2D.Vec2(0,0));//무중력
      this.ball = this.objectFactory.createBall(this.m_world);
      this.objectFactory.createGround(this.m_world);
      this.user1 = new GameUser(this.objectFactory.createPaddle(this.m_world, -43, 0, "player1"));
      this.user2 = new GameUser(this.objectFactory.createPaddle(this.m_world, 43, 0, "player2"))
      this.objectFactory.createObstacle(this.m_world);
      BallSpeedCorrection(this.ball, 2000);
      ContactListenerInit(this.m_world);
      //start : ball velocity init
      this.ball.SetLinearVelocity(new Box2D.Vec2(50,40));
  }

  public Keyboard(key: string) {
    switch (key) {
      case 'w':
        this.user1.directionButton = PaddleState.UP;
      break;
      case 's':
        this.user1.directionButton = PaddleState.DOWN;
      break;
      case 'q':
        this.user1.skill.ReverseEnemyPaddleDirection(this.user2);
      break;
      case 'u':
        this.user2.directionButton = PaddleState.UP;
      break;
      case 'j':
        this.user2.directionButton = PaddleState.DOWN;
      break;
      case 'y':
        this.user2.skill.ReverseEnemyPaddleDirection(this.user1);
      break;
    }
  }

  public KeyboardUp(key: string) {
    switch (key) {
      case 'w':
        this.user1.directionButton = PaddleState.STOP;
      break;
      case 's':
        this.user1.directionButton = PaddleState.STOP;
      break;
      case 'u':
        this.user2.directionButton = PaddleState.STOP;
      break;
      case 'j':
        this.user2.directionButton = PaddleState.STOP;
      break;
    }
  }
  public Step(settings: testbed.Settings): void {
    super.Step(settings);
    if (this.ball.GetUserData().pause){
      this.ball.SetPositionXY(0,0);
      this.ball.GetUserData().pause = false;
      BallSpeedCorrection(this.ball, 2000);
      //Todo : MatchScore 확인 하고 종료
    }
    MovePeddle(this.user1);
    MovePeddle(this.user2);
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