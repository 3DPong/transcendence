/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pongGame_old.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/21 04:10:07 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/28 21:49:20 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Box2DFactory from "box2d-wasm";
import { Helpers } from "@/simulation/Helpers";
import { Assert } from "@/utils/Assert";

// https://v8.dev/features/top-level-await
const __box2dModule: typeof Box2D & EmscriptenModule = await Box2DFactory();
const __helperModule: Helpers = new Helpers(__box2dModule);

/*
    (0) [ Core concept of Box2D simulation model ]
        https://box2d.org/documentation/index.html
*/

export namespace GameObject {
  export type BALL = "ball";
  export type PADDLE = "paddle";
  export type GROUND = "ground";
  export type IdType = BALL | PADDLE | GROUND | "";

  // bodyDef, FixtureDef 모음집.
  abstract class ObjectBase {
    private __m_BodyDef: Box2D.b2BodyDef;
    private __m_FixtureDef: Box2D.b2FixtureDef;

    constructor(BaseID: IdType) {
      const { b2BodyDef, b2FixtureDef } = __box2dModule;
      this.__m_BodyDef = new b2BodyDef();
      this.__m_FixtureDef = new b2FixtureDef();
      __helperModule.setIDtoBodyDef(this.__m_BodyDef, BaseID);
    }

    protected get bodyDef() {
      return this.__m_BodyDef;
    }

    protected get fixtureDef() {
      return this.__m_FixtureDef;
    }
  }

  export abstract class Object extends ObjectBase {
    protected m_Fixture: Box2D.b2Fixture | null = null;

    constructor(BaseID: IdType) {
      super(BaseID);
    }

    public get fixture() {
      Assert.NonNullish(
        this.m_Fixture,
        "Fixture is null. You need to register object to m_World before accessing Fixture data."
      );
      return this.m_Fixture;
    }

    public get body() {
      return this.fixture.GetBody();
    }

    public get shape() {
      return this.fixture.GetShape();
    }

    public get Id(): IdType {
      return __helperModule.getIDfromBody(this.body) as IdType;
    }

    public get position() {
      return this.body.GetPosition();
    }

    // get object type : b2CircleShape, b2PolygonShape ...etc
    public get shapeType() {
      return this.body.GetType();
    }

    protected set fixture(_fixture: Box2D.b2Fixture) {
      this.m_Fixture = _fixture;
    }

    public set position(pos: Box2D.b2Vec2) {
      this.body.GetPosition().Set(pos.x, pos.y);
    }

    public get angle() {
      return this.body.GetAngle();
    }

    // https://www.iforce2d.net/b2dtut/rotate-to-angle
    public set angle(degree: number) {
      this.body.SetTransform(this.body.GetPosition(), degree);
    }

    public registerTo(world: Box2D.b2World) {
      this.fixture = world.CreateBody(super.bodyDef).CreateFixture(super.fixtureDef);
      return this; // for object chaining.
    }

    // Object Destructor : https://www.iforce2d.net/b2dtut/removing-bodies
    public destory() {
      const { _free } = __box2dModule;
      const __bodyDataptr__ = this.body.GetUserData().get_pointer();
      if (__bodyDataptr__) _free(__bodyDataptr__);
      this.body.GetWorld().DestroyBody(this.body); // World로 부터 body 제거.
    }
  }

  export class Ball extends Object {
    constructor(
      radius: number = 10,
      position: Box2D.b2Vec2 = new __box2dModule.b2Vec2(0, 0) // default value
    ) {
      super("ball");
      const { b2CircleShape, b2_dynamicBody } = __box2dModule;

      super.bodyDef.set_type(b2_dynamicBody);
      super.bodyDef.set_position(position);
      super.bodyDef.bullet = true;

      const shape = new b2CircleShape();
      shape.set_m_radius(radius);
      super.fixtureDef.set_shape(shape);
      super.fixtureDef.set_density(4.0);
      super.fixtureDef.set_restitution(1.0); // 이건 충돌 후 속도 변화
      super.fixtureDef.set_friction(0.0); // 이 값이 0 이상일 경우 벽에 부딪히면서 반사 각이 감소.
    }

    public get radius() {
      return this.shape.get_m_radius();
    }

    public set radius(radius: number) {
      this.shape.set_m_radius(radius);
    }
  }

  export class PolygonObject extends Object {
    protected m_ChainShape: Box2D.b2ChainShape | null = null;

    constructor(id: IdType) {
      super(id);
    }

    public getPolygonVertices() {
      const { castObject, b2PolygonShape } = __box2dModule;
      const shape = castObject(this.shape, b2PolygonShape);
      const vc = shape.get_m_count();

      let verticiesArray: Box2D.b2Vec2[] = [];
      for (let i = 0; i < vc; i++) {
        const vec2 = shape.get_m_vertices(i);
        verticiesArray.push(vec2);
      }
      return verticiesArray;
    }
  }

  export class Ground extends PolygonObject {
    constructor(
      // id          : IdType, /* 제일 중요! --> 근데 이걸 내부에 중복으로 저장하고 있어서 걱정됨. */
      width: number,
      height: number,
      position: Box2D.b2Vec2
    ) {
      super("ground");
      const { b2Vec2, b2_staticBody } = __box2dModule;
      const { createChainShape } = __helperModule;

      const w_delta = width / 2;
      const h_delta = height / 2;
      const X = position.get_x();
      const Y = position.get_y();

      const cageVerts = [];
      cageVerts[0] = new b2Vec2(-w_delta, Y + h_delta);
      cageVerts[1] = new b2Vec2(X + w_delta, Y + h_delta);
      cageVerts[2] = new b2Vec2(X + w_delta, Y - h_delta);
      cageVerts[3] = new b2Vec2(X - w_delta, Y - h_delta);
      super.m_ChainShape = createChainShape(cageVerts, true);
      super.bodyDef.set_type(b2_staticBody);
    }

    public override registerTo(world: Box2D.b2World): this {
      Assert.NonNullish(super.m_ChainShape, "chainShape is null");
      this.fixture = world.CreateBody(super.bodyDef).CreateFixture(super.m_ChainShape, 0.0);
      return this;
    }
  }

  class PrismaticJointedObject extends PolygonObject {
    private __m_JointDef: Box2D.b2PrismaticJointDef;
    private __m_RestraintBodyDef: Box2D.b2BodyDef;
    private __m_JointAxis: Box2D.b2Vec2; // temp data

    constructor(id: IdType) {
      const { b2Vec2, b2BodyDef, b2PrismaticJointDef } = __box2dModule;

      super(id);
      this.__m_JointDef = new b2PrismaticJointDef();
      this.__m_RestraintBodyDef = new b2BodyDef();
      this.__m_JointAxis = new b2Vec2(1, 0);
    }

    protected get jointDef() {
      return this.__m_JointDef;
    }

    protected get restraintBodyDef() {
      return this.__m_RestraintBodyDef;
    }

    protected get jointAxis() {
      return this.__m_JointAxis;
    }

    protected set jointAxis(axis: Box2D.b2Vec2) {
      this.__m_JointAxis = axis;
    }
  }

  // 고정 과표계 이동만 가능한 객체.
  export class Paddle extends PrismaticJointedObject {
    // 이건 접근 가능하도록. 외부에서.
    protected m_Joint: Box2D.b2Joint | null = null;

    constructor(
      // id                  : IdType,
      position: Box2D.b2Vec2,
      size: Box2D.b2Vec2,
      jointControlPoint: Box2D.b2Vec2,
      jointAxis: Box2D.b2Vec2
    ) {
      super("paddle");

      const { b2Vec2, b2PolygonShape, b2_dynamicBody } = __box2dModule;

      // (0) Paddle setup ----------
      super.bodyDef.set_type(b2_dynamicBody);
      super.bodyDef.set_position(new b2Vec2(position.get_x(), position.get_y()));

      super.fixtureDef.set_density(1000.0);
      super.fixtureDef.set_friction(0.3);
      super.fixtureDef.set_restitution(0.8);

      const shape = new b2PolygonShape();
      shape.SetAsBox(size.get_x(), size.get_y());
      super.fixtureDef.set_shape(shape);

      // (1) Restraints setup ----------
      super.restraintBodyDef.set_position(jointControlPoint);

      // (2) Joint setup ----------
      super.jointDef.collideConnected = false;
      super.jointDef.enableMotor = true;
      super.jointDef.maxMotorForce = 3;
      super.jointAxis = jointAxis;
    }

    public override registerTo(world: Box2D.b2World): this {
      const { b2EdgeShape, b2Vec2 } = __box2dModule;

      // (1) 일단 기존 box부터 world에 붙이고, 그 이후에 진행.
      super.registerTo(world); // create and set Polygon body

      // (2) setUp Paddle Body to restraint
      const edge = new b2EdgeShape();
      const restraintFixture = world.CreateBody(super.restraintBodyDef).CreateFixture(edge, 0.0);

      const bodyA = restraintFixture.GetBody();
      const bodyB = this.body;
      const anchor = new b2Vec2(0, 0);
      const axis = super.jointAxis;

      // (3) Joint를 world에 붙이면 끝.
      super.jointDef.Initialize(bodyA, bodyB, anchor, axis);
      this.m_Joint = world.CreateJoint(super.jointDef);
      return this;
    }

    public get joint() {
      Assert.NonNullish(this.m_Joint, "Joint is null");
      return this.m_Joint;
    }
  }
} // End namespace

export enum eUserType {
  LEFT,
  RIGHT,
}

export class PongSimulation {
  private m_Counter = 0;
  private m_World: Box2D.b2World;
  private m_Objects: Map<string, GameObject.Object>;

  constructor() {
    const arenaSize = { width: 25, height: 18 };
    const paddleOffset = 11;
    const gravity = { x: 0, y: 0 }; // ZERO_GRAVITY
    const { b2Vec2, b2World } = __box2dModule;
    this.m_World = new b2World(new b2Vec2(gravity.x, gravity.y));
    this.m_Objects = new Map();

    // Ground = "ground0"
    this.addObject(new GameObject.Ground(arenaSize.width, arenaSize.height, new b2Vec2(0, 0)));

    // Ball = "ball1"
    this.addObject(new GameObject.Ball(1, new b2Vec2(0, 0)));

    // Paddle Left = "paddle2"
    this.addObject(
      new GameObject.Paddle(new b2Vec2(-paddleOffset, 0), new b2Vec2(0.2, 2), new b2Vec2(-15.0, 0), new b2Vec2(0, -1))
    );

    this.addObject(
      new GameObject.Paddle(new b2Vec2(paddleOffset, 0), new b2Vec2(0.2, 3), new b2Vec2(-15.0, 0), new b2Vec2(0, -1))
    );

    this._attachContactListener();
  }

  public get Box2dModule() {
    return __box2dModule;
  }

  public get HelperModule() {
    return __helperModule;
  }

  public get World(): Box2D.b2World {
    return this.m_World;
  }

  public addObject(gameObject: GameObject.Object) {
    gameObject.registerTo(this.m_World);

    // object 뒤에 숫자 붙여서 중복 피하기.
    const objectMapId = gameObject.Id + this.m_Counter++;
    this.m_Objects.set(objectMapId, gameObject);
    console.log("Adding object to world. Map Id =", objectMapId);
    return objectMapId;
  }

  // get object from Map
  public getObjectById(Id: string) {
    const obj = this.m_Objects.get(Id);
    Assert.NonNullish(obj, "[DEV] Wrong Object ID.");
    return obj;
  }

  // https://www.iforce2d.net/b2dtut/removing-bodies
  public removeObject(Id: GameObject.IdType) {
    // 일단 removeObject에서 counter를 감소시키지 않음. 지속 누적으로 간드아.
    this.getObjectById(Id).destory(); // call destuctor to delete from world.
    this.ObjectMap.delete(Id);
  }

  public get ObjectMap() {
    return this.m_Objects;
  }

  // step to next simulation
  public step(deltaMs?: number) {
    const timeStepMillis = 1 / 60;
    const velocityIterations = 8;
    const positionIterations = 3;
    let TIME_MS;
    if (deltaMs) {
      // calculate no more than a 60th of a second during one world.Step() call
      const maxTimeStepMs = (1 / 60) * 1000;
      const clampedDeltaMs = Math.min(deltaMs, maxTimeStepMs);
      TIME_MS = clampedDeltaMs / 1000;
    } else {
      TIME_MS = timeStepMillis;
    }
    this.m_World.Step(TIME_MS, velocityIterations, positionIterations);
  }

  // world object 파괴 (매우 중요! 반드시 내가 호출해줘야 함!!!)
  public destroy() {
    const { destroy } = __box2dModule;
    // 일전에 공 만들때, UserData로 String을 동적할당하였으니 여기서 반드시 free해야 함.
    for (const object of this.m_Objects.values()) {
      object.destory();
    }
    destroy(this.m_World); // call C++ desturctor.
  }

  // ********************************************************
  // Contact Listener Callback
  // - https://gist.github.com/BrianMacIntosh/fefca14bcc5ff82491f3
  // - http://blog.sethladd.com/2011/09/box2d-collision-damage-for-javascript.html
  private _attachContactListener() {
    console.log("attaching Contact Listener");
    const { wrapPointer, b2Contact, b2Manifold, b2ContactImpulse, JSContactListener } = __box2dModule;

    // const { getIDfromBody } = this.__helperModule;
    const { getIDfromBody } = __helperModule;
    // const contactListener = new this.__box2dModule.JSContactListener();
    const contactListener = new JSContactListener();

    // (1) fired when two fixtures start contacting (aka touching) each other
    contactListener.BeginContact = function (contact: any) {
      contact = wrapPointer(contact, b2Contact);
      // contact logic here...
    };

    // (2) fired when two fixtures cease contact)
    contactListener.EndContact = function (contact: any) {
      contact = wrapPointer(contact, b2Contact);
      // contact logic here...
    };

    // (3) fired before contact is resolved. you have the opportunity to override the contact here.)
    contactListener.PreSolve = function (contact: any, oldManifold: any) {
      contact = wrapPointer(contact, b2Contact);
      oldManifold = wrapPointer(oldManifold, b2Manifold);
      // contact logic here...
    };

    // (4) fired once the contact is resolved. the event also includes the impulse from the contact.
    contactListener.PostSolve = function (contact: any, impulse: any) {
      // // (1) get userData : string
      contact = wrapPointer(contact, b2Contact);
      impulse = wrapPointer(impulse, b2ContactImpulse);

      const BodyA = (contact as Box2D.b2Contact).GetFixtureA().GetBody();
      const BodyA_Id = getIDfromBody(BodyA);

      const BodyB = (contact as Box2D.b2Contact).GetFixtureB().GetBody();
      const BodyB_Id = getIDfromBody(BodyB);

      let BALL_BODY = null;
      let PADDLE_BODY = null;

      // (2) Setup data, only when the situation is about a Ball hitting Paddle object.
      if (BodyA_Id === "ball" && BodyB_Id === "paddle") {
        BALL_BODY = BodyA;
        PADDLE_BODY = BodyB;
      } else if (BodyA_Id === "paddle" && BodyB_Id === "ball") {
        BALL_BODY = BodyB;
        PADDLE_BODY = BodyA;
      } else {
        // if not, return.
        return;
      }

      // (3) Calculate paddle and ball's velocity to apply spin.
      // https://patentimages.storage.googleapis.com/d0/d1/40/728996395938c5/KR101694296B1.pdf
      const paddle_velocity = PADDLE_BODY.GetLinearVelocity();
      console.log("Ball hits Paddle!", "paddle's velocity : ", paddle_velocity.get_x(), paddle_velocity.get_y()); // WORKING

      const collisionImpulse = impulse.get_normalImpulses(0); // 충돌 에너지
      // console.log(collisionImpulse);
    };
    this.m_World.SetContactListener(contactListener);
  }
}
