
import * as Box2D from "../Box2D";
import { GamePlayer } from "./GamePlayer";
import { ObjectFactory } from "./object/ObjectFactory";
import { MovePeddle, BallSpeedCorrection, RandomVec2} from "./object/ObjectController";
import { ContactListenerInit } from "./ContactListenerInit";
import { Server } from 'socket.io'
import { BALL_SPEED, MAP_WIDTH, PADDLE_OFFSET } from "../enum/GameEnv";
import { RenderData, ScoreData } from "../gameData";
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
  timeStepMillis: number = 1/60,
  renderDatas : RenderData[],
  scoreData : ScoreData
){
    const velocityIterations = 10;
    const positionIterations = 8;
    if (simulator.ball.GetUserData().pause){
      simulator.ball.SetPositionXY(0,0);
      simulator.ball.GetUserData().pause = false;
      simulator.ball.SetLinearVelocity(RandomVec2());
      BallSpeedCorrection(simulator.ball, BALL_SPEED);
      scoreData.leftScore = simulator.ball.GetUserData().player1_score;
      scoreData.rightSocre = simulator.ball.GetUserData().player2_score;
      server.to(gameId).emit('score', scoreData);
    }
    MovePeddle(simulator.user1);
    MovePeddle(simulator.user2);
    simulator.world.Step(timeStepMillis,velocityIterations,positionIterations);

    for (
      let body : Box2D.Body = simulator.world.GetBodyList(), i = 0; 
      body !== null; 
      body = body.m_next, i++
    ){
      renderDatas[i].x = body.GetPosition().x;
      renderDatas[i].y = body.GetPosition().y;
      renderDatas[i].angle = body.GetAngle();
    }
    server.to(gameId).emit('render', renderDatas);
}
