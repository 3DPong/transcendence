import { GamePlayer } from '../GamePlayer';
import * as Box2D from '../../Box2D';
import { PaddleState } from '../../enum/GameEnum';
import { BALL_MAX_ANGLE, BALL_PI, MAP_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED } from '../../enum/GameEnv';

export function MovePeddle(user: GamePlayer) {
  if (user.directionButton === PaddleState.STOP) {
    return;
  }
  const pos: Box2D.Vec2 = user.paddle.GetPosition();
  let dir: PaddleState = user.directionButton;
  if (user.directionReverse) {
    dir = user.directionButton === PaddleState.UP ? PaddleState.DOWN : PaddleState.UP;
  }
  if (dir === PaddleState.UP && pos.y <= MAP_HEIGHT - PADDLE_HEIGHT) {
    user.paddle.SetPositionXY(pos.x, pos.y + PADDLE_SPEED);
  } else if (dir === PaddleState.DOWN && pos.y >= -(MAP_HEIGHT - PADDLE_HEIGHT)) {
    user.paddle.SetPositionXY(pos.x, pos.y - PADDLE_SPEED);
  }
}

export function BallSpeedCorrection(ball: Box2D.Body, speed: number) {
  const afterVelocity: number = speed;
  const beforeVelocity: number = ball.GetLinearVelocity().LengthSquared();
  const vel: Box2D.Vec2 = ball.GetLinearVelocity().Clone();
  const coefficient: number = Math.sqrt(afterVelocity / beforeVelocity);
  ball.SetLinearVelocity(new Box2D.Vec2(vel.x * coefficient, vel.y * coefficient));
}

export function RandomVec2(): Box2D.Vec2 {
  const vec2: Box2D.Vec2 = new Box2D.Vec2(Math.random() - 0.5, Math.random() - 0.5);
  const dt: number = vec2.y / vec2.x;
  const tx: number = vec2.x;
  if (dt > 1) {
    // y=x 대칭변환
    vec2.x = vec2.y;
    vec2.y = tx;
  } else if (dt < -1) {
    //y=-x 대칭변환
    vec2.x = vec2.y;
    vec2.y = -tx;
  }
  return vec2;
}

export function BallAngleCorrection(ball: Box2D.Body, paddle: Box2D.Body) {
  const paddleHeight: number = ball.GetPosition().y - paddle.GetPosition().y;
  const velocityVec2: Box2D.Vec2 = ball.GetLinearVelocity();
  const nx: number = velocityVec2.x < 0 ? -1 : 1;
  let theta: number = (paddleHeight / (PADDLE_HEIGHT / 2)) * BALL_MAX_ANGLE;
  if (nx < 0) {
    theta = BALL_PI - theta;
  }
  const ny: number = nx * Math.tan(theta);

  ball.SetLinearVelocity(new Box2D.Vec2(nx, ny));
}
