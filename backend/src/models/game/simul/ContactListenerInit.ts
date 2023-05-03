import * as Box2D from '../Box2D';
import { MAP_WIDTH, MAP_HEIGHT, BALL_SPEED } from '../enum/GameEnv';
import { BallAngleCorrection, BallSpeedCorrection } from './object/ObjectController';

export function ContactListenerInit(world: Box2D.World) {
  //  world.GetContactManager().m_contactListener.BeginContact = ()=>{};
  //  world.GetContactManager().m_contactListener.EndContact = ()=>{};

  //충돌 직전 콜 되는 이벤트, score확인
  world.GetContactManager().m_contactListener.PreSolve = function (
    contact: Box2D.Contact,
    oldManifold: Box2D.Manifold
  ): void {
    const Abody: Box2D.Body = contact.GetFixtureA().GetBody();
    const Bbody: Box2D.Body = contact.GetFixtureB().GetBody();
    const ball: Box2D.Body = Abody.GetUserData().name === 'ball' ? Abody : Bbody;
    const newManifold: Box2D.Manifold = contact.GetManifold();
    if (newManifold.localPoint.x === MAP_WIDTH && newManifold.localPoint.y === MAP_HEIGHT) {
      ++ball.GetUserData().player1_score;
      ball.GetUserData().pause = true;
      //ball init
    } else if (newManifold.localPoint.x === -MAP_WIDTH && newManifold.localPoint.y === -MAP_HEIGHT) {
      ++ball.GetUserData().player2_score;
      ball.GetUserData().pause = true;
      //ball init
    }
  };

  //충돌후 콜 되는 이벤트, 공 속도보정
  world.GetContactManager().m_contactListener.PostSolve = function (
    contact: Box2D.Contact,
    impulse: Box2D.ContactImpulse
  ): void {
    const Abody: Box2D.Body = contact.GetFixtureA().GetBody();
    const Bbody: Box2D.Body = contact.GetFixtureB().GetBody();
    const ball: Box2D.Body = Abody.GetUserData().name === 'ball' ? Abody : Bbody;
    if (Abody.GetUserData().name === 'paddle') {
      BallAngleCorrection(ball, Abody);
    } else if (Bbody.GetUserData().name === 'paddle') {
      BallAngleCorrection(ball, Bbody);
    }
    BallSpeedCorrection(ball, BALL_SPEED * 2);
  };
}
