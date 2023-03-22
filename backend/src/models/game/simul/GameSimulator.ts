
import * as Box2D from "../Box2D";
import { GameUser } from "./GameUser";
import { ObjectFactory } from "./object/ObjectFactory";
import { MovePeddle, BallSpeedCorrection, RandomVec2} from "./object/ObjectController";
import { ContactListenerInit } from "./ConatactListenerInit";

export class GameSimulator{
  //public world : Box2D.World = new Box2D.World(new Box2D.Vec2());
  public objectFactory : ObjectFactory = new ObjectFactory();
  private world : Box2D.World = new Box2D.World(new Box2D.Vec2(0,0));
  private ball : Box2D.Body;
  private user1: GameUser;
  private user2: GameUser;

  constructor(){
      //ball create & add to world
      this.world.SetGravity(new Box2D.Vec2(0,0));//무중력
      this.ball = this.objectFactory.createBall(this.world);
      this.objectFactory.createGround(this.world);
      this.user1 = new GameUser(this.objectFactory.createPaddle(this.world, -43, 0, "player1"));
      this.user2 = new GameUser(this.objectFactory.createPaddle(this.world, 43, 0, "player2"))
      this.objectFactory.createObstacle(this.world);
      BallSpeedCorrection(this.ball, 2000);
      ContactListenerInit(this.world);
      //start : ball velocity init
      this.ball.SetLinearVelocity(new Box2D.Vec2(50,40));
  }

  public step(timeStepMillis: number = (1 / 60)){
    const velocityIterations = 10;
    const positionIterations = 8;
    if (this.ball.GetUserData().pause){
      this.ball.SetPositionXY(0,0);
      this.ball.GetUserData().pause = false;
      this.ball.SetLinearVelocity(RandomVec2());
      BallSpeedCorrection(this.ball, 2000);
      //Todo : MatchScore 확인 하고 종료
    }
    MovePeddle(this.user1);
    MovePeddle(this.user2);
    this.world.Step(timeStepMillis,velocityIterations,positionIterations);
  }
}
/*
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
*/