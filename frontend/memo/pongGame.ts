/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pongGame.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/21 04:10:07 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/27 05:39:13 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import Box2DFactory from 'box2d-wasm';
import { Helpers } from './helpers';
import { Assert } from '@/utils/Assert';

// https://v8.dev/features/top-level-await Only Available in es2017 !!
const __box2dModule : typeof Box2D & EmscriptenModule = await Box2DFactory();
const __helperModule : Helpers = new Helpers(__box2dModule);

// --------------------------------------------------------------------------------------------
// (0) [ Core concept of Box2D simulation model ]
//     https://box2d.org/documentation/index.html
// --------------------------------------------------------------------------------------------
// (1) [ Box2d Official reference ] --> 여기 보는게 그냥 가장 좋다...
//     https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_hello.html
// --------------------------------------------------------------------------------------------
//  Box2D.wasm                                                                                    
//      [ https://github.com/Birch-san/box2d-wasm/tree/master/docs ]                              
//      [ https://github.com/Birch-san/box2d-wasm/tree/master/demo/backend ]                      
//      [ https://github.com/Birch-san/box2d-wasm/blob/master/docs/00-importing-box2d-wasm.md ]   
//      - import Box2DFactory from 'box2d-wasm';                                                  
// --------------------------------------------------------------------------------------------
// TODO : 객체 에 데이터를 추가하면, 뒤에 숫자를 붙힌다. ex. ball0 ball1 ball2 ball3...
// 근데 이걸 중간거를 지우거나 하면 나중에 숫자로 인해서 겹친다.
// ex. ball0를 지우고 새로 추가시 ball3가 추가시도됨. 이미 ball3가 있기 때문에 map에 추가가 안됨.
// 일단 pong에 static counter를 써서, 객체 추가시마다 counter++해주자. 일단 임시로. 나중에 더 나은 방법 찾기
// --------------------------------------------------------------------------------------------


export namespace GameObject {

export type BALL = 'ball';
export type PADDLE = 'paddle';
export type GROUND = 'ground';
export type IdType = BALL | PADDLE | GROUND | "";

export abstract class Object
{
    // * null if not registered.
    // -------------------------------------------------------
    protected m_Fixture?   : Box2D.b2Fixture | null = null;
    // -------------------------------------------------------

    protected __m_BodyDef     : Box2D.b2BodyDef;
    protected __m_FixtureDef  : Box2D.b2FixtureDef;

    constructor(
        // protected readonly __box2dModule: typeof Box2D & EmscriptenModule, 
        // protected readonly __helperModule: Helpers,
        BaseID          : IdType, /* 제일 중요! --> 근데 이걸 내부에 중복으로 저장하고 있어서 걱정됨. */
    ) {
        const { b2BodyDef, b2FixtureDef } = __box2dModule;

        this.__m_BodyDef = new b2BodyDef();
        this.__m_FixtureDef = new b2FixtureDef();
        __helperModule.setIDtoBodyDef(this.__m_BodyDef, BaseID);
    }

    public get fixture() {
        Assert.NonNullish(this.m_Fixture, "fixture is null");
        return this.m_Fixture;
    }

    public get body() {
        return this.fixture.GetBody();
    }

    public get shape() {
        return this.fixture.GetShape();
    }

    public get Id(): IdType
    {
        // return this.m_Id;
        return (__helperModule.getIDfromBody(this.body)) as IdType;
    } 

    public get position() {
        return this.body.GetPosition();
        // return this.m_Position;
    }

    public set position(pos: Box2D.b2Vec2) {
        // this.m_BodyDef.set_position(pos); --> def는 등록하는 순간 바꿔도 적용되지 않음.
        // this.m_Position = pos;
        this.body.GetPosition().Set(pos.x, pos.y);
    }

    public get angle() {
        return this.__m_BodyDef.get_angle();
    }

    public set angle(degree: number) {
        this.__m_BodyDef.set_angle(degree);
        // this.m_Angle = degree;
    }

    public registerTo(world: Box2D.b2World){
        this.m_Fixture = world.CreateBody(this.__m_BodyDef).CreateFixture(this.__m_FixtureDef);
        return this; // for object chaining.
    }

    // Object Destructor : https://www.iforce2d.net/b2dtut/removing-bodies
    public destory()
    {
        // const { destroy, _free } = this.__box2dModule;
        const { _free } = __box2dModule;
        const __bodyDataptr__ = this.body.GetUserData().get_pointer();
        if (__bodyDataptr__)
            _free(__bodyDataptr__);
        this.body.GetWorld().DestroyBody(this.body); // World로 부터 body 제거.
    }
}

export class Ball extends Object
{
    constructor(
        // __box2dModule: typeof Box2D & EmscriptenModule, 
        // __helperModule: Helpers,
        id          : IdType, /* 제일 중요! --> 근데 이걸 내부에 중복으로 저장하고 있어서 걱정됨. */
        radius      : number = 10,
        position    : Box2D.b2Vec2 = new __box2dModule.b2Vec2(0, 0), // default value

    ) {
        // super(__box2dModule, __helperModule);
        super(id);
        // const { b2CircleShape, b2_dynamicBody } = this.__box2dModule;
        const { b2CircleShape, b2_dynamicBody } = __box2dModule;

        this.__m_BodyDef.set_type(b2_dynamicBody);
        this.__m_BodyDef.set_position(position);
        this.__m_BodyDef.bullet = true;

        const shape = new b2CircleShape();
        shape.set_m_radius(radius);
        this.__m_FixtureDef.set_shape(shape);
        this.__m_FixtureDef.set_density(4.0);
        this.__m_FixtureDef.set_restitution(1.0); // 이건 충돌 후 속도 변화
        this.__m_FixtureDef.set_friction(0.0); // 이 값이 0 이상일 경우 벽에 부딪히면서 반사 각이 감소.
    }

    public get radius() {
        return (this.shape.get_m_radius());
    }
    
    public set radius(radius: number) {
        this.shape.set_m_radius(radius);
    }
}

export class PolygonObject extends Object 
{
    public getPolygonVertices() {
        const { castObject, b2PolygonShape } = __box2dModule;
        const shape =  castObject(this.shape, b2PolygonShape);
        const vc = shape.get_m_count();

        let verticiesArray: Box2D.b2Vec2[] = [];
        for (let i = 0; i < vc; i++) {
            const vec2 = shape.get_m_vertices(i);
            verticiesArray.push(vec2);
            console.log("vertices : ", vec2.x, vec2.y);
        }
        return verticiesArray;
    }
}

export class Ground extends PolygonObject
{
    private __m_ChainShape;

    constructor(
        id          : IdType, /* 제일 중요! --> 근데 이걸 내부에 중복으로 저장하고 있어서 걱정됨. */
        width: number,
        height: number,
        position: Box2D.b2Vec2
    ) {
        super(id);
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
        this.__m_ChainShape = createChainShape(cageVerts, true);;
        this.__m_BodyDef.set_type(b2_staticBody);
    }

    public override registerTo(world: Box2D.b2World): this  {
        this.m_Fixture = world.CreateBody(this.__m_BodyDef).CreateFixture(this.__m_ChainShape, 0.0)
        return this;
    }
}

export class Paddle extends PolygonObject
{
    protected m_Joint?              : Box2D.b2Joint | null;

    private __m_JointDef            : Box2D.b2PrismaticJointDef;
    private __m_RestraintBodyDef    : Box2D.b2BodyDef;
    private __m_JointAxis           : Box2D.b2Vec2;

    constructor(
        // __box2dModule   : typeof Box2D & EmscriptenModule, 
        // __helperModule  : Helpers,

        id          : IdType, /* 제일 중요! --> 근데 이걸 내부에 중복으로 저장하고 있어서 걱정됨. */
        position    : Box2D.b2Vec2,
        size        : Box2D.b2Vec2,

        jointControlPointPosition   : Box2D.b2Vec2,
        jointDirectionAxis          : Box2D.b2Vec2,

    ) {
        super(id);

        const {
            b2Vec2,
            b2BodyDef,
            b2PolygonShape,
            b2_dynamicBody,
            b2PrismaticJointDef,
        } = __box2dModule;
        // } = this.__box2dModule;

        // (0) Paddle setup ----------
        this.__m_BodyDef.set_type(b2_dynamicBody);
        this.__m_BodyDef.set_position(new b2Vec2(position.get_x(), position.get_y()));

        this.__m_FixtureDef.set_density(1000.0);
        this.__m_FixtureDef.set_friction(0.3);
        this.__m_FixtureDef.set_restitution(0.8);
        const shape = new b2PolygonShape();
        shape.SetAsBox(size.get_x(), size.get_y());
        this.__m_FixtureDef.set_shape(shape);

        // (1) Restraints setup ----------
        this.__m_RestraintBodyDef = new b2BodyDef();
        this.__m_RestraintBodyDef.set_position(jointControlPointPosition);
        
        // (2) Joint setup ----------
        this.__m_JointDef = new b2PrismaticJointDef();
        this.__m_JointDef.collideConnected = false;
        this.__m_JointDef.enableMotor = true;
        this.__m_JointDef.maxMotorForce = 3;
        this.__m_JointAxis = jointDirectionAxis;
    }
    
    public override registerTo(world: Box2D.b2World): this 
    {
        // const { b2EdgeShape, b2Vec2 } = this.__box2dModule;
        const { b2EdgeShape, b2Vec2 } = __box2dModule;

        // (1) 일단 기존 box부터 world에 붙이고, 그 이후에 진행.
        super.registerTo(world); // create and set Polygon body

        // (2) setUp Paddle Body to restraint
        const edge = new b2EdgeShape();
        const restraintFixture = world.CreateBody(this.__m_RestraintBodyDef).CreateFixture(edge, 0.0);

        const bodyA = restraintFixture.GetBody();
        const bodyB = this.body;
        const anchor = new b2Vec2(0, 0);
        const axis = this.__m_JointAxis;

        // (3) Joint를 world에 붙이면 끝.
        this.__m_JointDef.Initialize(bodyA, bodyB, anchor, axis);
        this.m_Joint = world.CreateJoint(this.__m_JointDef);
        return this;
    }  

    public get joint() {
        Assert.NonNullish(this.m_Joint, "Joint is null");
        return this.m_Joint;
    }

    // because BOX is a polygon...
    // 나중에 babylon.js에 이 폴리곤 데이터를 넘겨주기 위함.  
}

} // End namespace

export enum eUserType 
{
    LEFT,
    RIGHT,
}

export class PongSimulation
{
    private m_Counter = 0;
    private m_World          : Box2D.b2World;
    private m_Objects        : Map< string, GameObject.Object >;

    constructor(
        // private readonly __box2dModule: typeof Box2D & EmscriptenModule,
        // private readonly __helperModule: Helpers
    ) {
        const arenaSize = { width: 25, height: 18 };
        const paddleOffset = 11;
        const gravity = { x: 0, y: 0 }; // ZERO_GRAVITY
        
        const { b2Vec2, b2World } = __box2dModule;
        this.m_World = new b2World(new b2Vec2(gravity.x, gravity.y));
        this.m_Objects = new Map();

        // this.addObjectToWorld( new Game.Ball(__box2dModule, __helperModule, "ball", 3, new b2Vec2(0, 0)));

        // Ground = "ground0"
        this.addObject( new GameObject.Ground("ground", arenaSize.width, arenaSize.height, new b2Vec2(0, 0)));

        // Ball = "ball1"
        this.addObject( new GameObject.Ball("ball", 1, new b2Vec2(0, 0)));

        // Paddle Left = "paddle2"
        this.addObject(new GameObject.Paddle("paddle",
                                                     new b2Vec2(-paddleOffset, 0),
                                                         new b2Vec2(0.2, 2),
                                    new b2Vec2(-15.0, 0),
                                           new b2Vec2(0, -1)
        ));

        this.addObject(new GameObject.Paddle("paddle",
                                                     new b2Vec2(paddleOffset, 0),
                                                         new b2Vec2(0.2, 3),
                                    new b2Vec2(-15.0, 0),
                                           new b2Vec2(0, -1)
        ));

        this._attachContactListener();
    }

    public get Box2dModule() {
        // return this.__box2dModule;
        return __box2dModule;
    }

    public get HelperModule() {
        // return this.__helperModule;
        return __helperModule;
    }

    public get World(): Box2D.b2World {
        return this.m_World;
    }


    public addObject(gameObject: GameObject.Object){
        gameObject.registerTo(this.m_World);

        // object 뒤에 숫자 붙여서 중복 피하기.
        // const objectMapId = gameObject.Id + this.ObjectMap.size;
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

    public get ObjectMap(){
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
        // const { destroy } = this.__box2dModule;
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

        const {
            wrapPointer,
            b2Contact,
            b2Manifold,
            b2ContactImpulse,
            JSContactListener
        // } = this.__box2dModule;
        } = __box2dModule;

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
            console.log(
                "Ball hits Paddle!",
                "paddle's velocity : ",
                paddle_velocity.get_x(),
                paddle_velocity.get_y()
            ); // WORKING

            const collisionImpulse = impulse.get_normalImpulses(0); // 충돌 에너지
            // console.log(collisionImpulse);
        };
        this.m_World.SetContactListener(contactListener);
    } 
}








// [ intersection type ]
// https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html

// https://betterprogramming.pub/how-to-write-an-async-class-constructor-in-typescript-javascript-7d7e8325c35e

/*
export class PongSimulationFactory {
    private constructor(){}  // cannot instanciate Factory

    // (1) 이걸 쓰면 내부에서 box2D wasm파일을 load 진행.
    public static async build() 
    {
        const box2d_wasm = await Box2DFactory({ locateFile: (url) => url });
        const helper_using_wasm = await new Helpers(box2d_wasm);
        return new PongSimulation(box2d_wasm, helper_using_wasm);
    }
}
*/

// *********************************************************************
// |                        How to Use with Build()                    |
// *********************************************************************
// (async () => {
    // const game1 = await PongSimulationFactory.build(); // Must wait to finish WASM load !!
    // const ball = new Game.Ball()
    // game1.addObjectToWorld()
    // ... do something ...
// })(/* IIFE */);
// *********************************************************************