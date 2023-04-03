
import * as Box2D from "../Box2D";
import { GamePlayer } from "./GamePlayer";
import { ObjectFactory } from "./object/ObjectFactory";
import { MovePeddle, BallSpeedCorrection, RandomVec2} from "./object/ObjectController";
import { ContactListenerInit } from "./ContactListenerInit";
import { Server } from 'socket.io'
import { BALL_SPEED, MAP_WIDTH, PADDLE_OFFSET } from "../enum/GameEnv";
export class MatchInterrupt {
  isInterrupt : boolean = false;
  sid : string = undefined;
}

export class GameSimulator{
  public objectFactory : ObjectFactory = new ObjectFactory();
  public world : Box2D.World = new Box2D.World(new Box2D.Vec2(0,0));
  public matchInterrupt : MatchInterrupt = new MatchInterrupt();
  public ball : Box2D.Body;
  public user1: GamePlayer;
  public user2: GamePlayer;

  constructor(user1 : GamePlayer, user2 : GamePlayer){
      //ball create & add to world
      this.world.SetGravity(new Box2D.Vec2(0,0));//무중력
      this.ball = this.objectFactory.createBall(this.world);
      this.objectFactory.createGround(this.world);
      this.user1 = user1;
      this.user2 = user2;
      user1.paddle = this.objectFactory.createPaddle(this.world, -(MAP_WIDTH-PADDLE_OFFSET),0,"player1");
      user2.paddle = this.objectFactory.createPaddle(this.world, MAP_WIDTH-PADDLE_OFFSET,0,"player2");
      this.objectFactory.createObstacle(this.world);
      BallSpeedCorrection(this.ball, BALL_SPEED);
      ContactListenerInit(this.world);
      //start : ball velocity init
      this.ball.SetLinearVelocity(RandomVec2());
    }
}

export function step(
  server : Server,
  gameId : string ,
  simulator : GameSimulator,
  timeStepMillis: number = 1/60
){
    const velocityIterations = 10;
    const positionIterations = 8;
    if (simulator.ball.GetUserData().pause){
      simulator.ball.SetPositionXY(0,0);
      simulator.ball.GetUserData().pause = false;
      simulator.ball.SetLinearVelocity(RandomVec2());
      BallSpeedCorrection(simulator.ball, BALL_SPEED);
    }
    MovePeddle(simulator.user1);
    MovePeddle(simulator.user2);
    simulator.world.Step(timeStepMillis,velocityIterations,positionIterations);
    //data 뽑아서 보내줘야함 
    for (let body : Box2D.Body = simulator.world.GetBodyList(); body !== null; body = body.m_next){
      server.to(gameId).emit('InGameData', body.GetPosition());
    }  
}
