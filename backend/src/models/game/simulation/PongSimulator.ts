/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PongSimulator.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/21 04:10:07 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 15:15:37 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Helpers } from './Helpers';
import { b2Object, b2Ground, b2Ball, b2Paddle, b2RandomPolygon } from './Objects';
import * as Box2D from '../Box2D'
export namespace ObjectID {
    export const BALL = "ball";
    export const GROUND = "ground";
    export const PADDLE_LEFT = "paddle_left";
    export const PADDLE_RIGHT = "paddle_right";
}

export class PongSimulator
{
    private m_Time: number = 0.0; // 시뮬레이터 시간.
    private m_isStarted: boolean = false;

    private m_World: Box2D.World;
    private m_Ground: b2Ground;
    private m_Ball: b2Ball;
    private m_PaddleLeft: b2Paddle;
    private m_PaddleRight: b2Paddle;
    private m_ObjectList: Set<b2Object> = new Set();

    constructor(
        private readonly box2D,
        private readonly helperModule = new Helpers(box2D)
    ) {
        const arenaSize = { width: 25, height: 18 };
        const paddleOffset = 11;
        const gravity = { x: 0, y: 0 }; // ZERO_GRAVITY
        const { b2Vec2, b2World } = box2D;

        // Setup World
        this.m_World = new b2World(new b2Vec2(gravity.x, gravity.y));

        // Setup Ground
        this.m_Ground = new b2Ground(box2D,
            {
                width: arenaSize.width,
                height: arenaSize.height,
                position: new b2Vec2(0, 0),
                Id: ObjectID.GROUND,
            })
            .RegisterTo(this.m_World);
            this.m_ObjectList.add(this.m_Ground);

        // Setup Ball
        this.m_Ball = new b2Ball(box2D,
            {
                radius: 1,
                position: new b2Vec2(0, 0),
                Id: ObjectID.BALL,
            })
            .RegisterTo(this.m_World);
            this.m_ObjectList.add(this.m_Ball);

        // Setup Paddle Left
        this.m_PaddleLeft = new b2Paddle(box2D,
            {
                position: new b2Vec2(-paddleOffset, 0),
                size: new b2Vec2(0.2, 2),
                jointControlPoint: new b2Vec2(-(arenaSize.width/2), 0),
                jointAxis: new b2Vec2(0, -1),
                Id: ObjectID.PADDLE_LEFT, 
            })
            .RegisterTo(this.m_World);
            this.m_ObjectList.add(this.m_PaddleLeft);

        // Setup Paddle Right
        this.m_PaddleRight = new b2Paddle(box2D,
            {
                position: new b2Vec2(+paddleOffset, 0),
                size: new b2Vec2(0.2, 2),
                jointControlPoint: new b2Vec2(+(arenaSize.width/2), 0),
                jointAxis: new b2Vec2(0, -1),
                Id: ObjectID.PADDLE_LEFT, 
            })
            .RegisterTo(this.m_World);
            this.m_ObjectList.add(this.m_PaddleRight);

        // Attach contact event listenr
        this._attachContactListener();
    }

    public get Box2dModule() 
    {
        return this.box2D;
    }

    public get HelperModule() 
    {
        return this.helperModule;
    }

    public get World(): Box2D.b2World 
    {
        return this.m_World;
    }

    public get PaddleLeft() 
    {
        return this.m_PaddleLeft;
    }

    public get PaddleRight() 
    {
        return this.m_PaddleRight;
    }

    public get Ball() 
    {
        return this.m_Ball;
    }

    public get Ground() 
    {
        return this.m_Ground;
    }

    public get ObjectList(){
        return this.m_ObjectList;
    }


    public createRandomPolygonObject(radius: number, posX: number, posY: number)
    {
        const { b2Vec2 } = this.Box2dModule;
        const obj = new b2RandomPolygon(this.Box2dModule,
            {
                randomMaxRadius: radius,
                position: new b2Vec2(posX, posY)
            })
            .RegisterTo(this.m_World);
        this.ObjectList.add(obj);
        return obj;
    }




    public start()
    {
        this.m_isStarted = true;
        
        const TIME_STEP = 1000 / 60;

        let loop = setInterval(() => {

            if (this.m_isStarted === false) {
                clearInterval(loop);
                this.m_Time = 0; // reset timer
            }
            this.step();
            this.m_Time += TIME_STEP;
        })
    }
    
    public pause()
    {
        this.m_isStarted = false;
    }
    
    public reset()
    {
        // 시뮬레이션 시작 초기화면으로 돌아가기
    }



    /**
     * Take a time step. This performs collision detection, integration, and constraint solution.
     * @Defaults timeStepMillis = (1/60 fps)
     * @link1 https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_hello.html
     * @link https://www.iforce2d.net/b2dtut/worlds
     */
    public step(timeStepMillis: number = (1 / 60)) 
    {
        /* ------------------------------------------------------------------------------

            매 프레임마다 데이터를 뽐으려면 여기서 하면 됩니다.

        ------------------------------------------------------------------------------ */
        const velocityIterations = 6;
        const positionIterations = 2;
        this.m_World.Step(timeStepMillis, velocityIterations, positionIterations);
        this.m_Time += timeStepMillis; // 시간 누적.
    }

    /**
     * World object 파괴 (매우 중요! 반드시 내가 호출해줘야 함!!!)
     * @link https://www.iforce2d.net/b2dtut/removing-bodies
     */
    public destroy() 
    {
        const { destroy } = this.box2D;

        // TODO: 여기서 반드시 destory 호출해줘여 한다!!!
        // const bodyList = this.m_World.GetBodyList();
        // 일전에 공 만들때, UserData로 String을 동적할당하였으니 여기서 반드시 free해야 함.
        // for (const object of this.m_Objects.values()) {
            // object.destory();
        // }

        destroy(this.m_World); // call C++ desturctor.
    }

    // 
    /**
     * Register contact listener callback (b2Object간 충돌시 등록된 콜백이 실행됨.)
     * @link1 https://gist.github.com/BrianMacIntosh/fefca14bcc5ff82491f3
     * @link2 http://blog.sethladd.com/2011/09/box2d-collision-damage-for-javascript.html
     */
    private _attachContactListener() {
        console.log("attaching Contact Listener");
        const {
            wrapPointer,
            b2Contact,
            b2Manifold,
            b2ContactImpulse,
            JSContactListener,
        } = this.box2D;

        const { getIDfromBody } = this.helperModule;
        const contactListener = new JSContactListener();
        const Ball = this.m_Ball;
        const PaddleLeft = this.m_PaddleLeft;
        const PaddleRight = this.m_PaddleRight;

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
        // 현재 시점에서 contact와 impulse는 pointer, 즉 number이다.
        contactListener.PostSolve = function (contact: number /*pointer*/, impulse: number /*pointer*/) {
            // (1) type-cast pointer
            const contactPtr = wrapPointer(contact, b2Contact);
            const impulsePtr = wrapPointer(impulse, b2ContactImpulse);

            // (2) get body data
            const BodyA = contactPtr.GetFixtureA().GetBody();
            const BodyA_Id = getIDfromBody(BodyA);
            const BodyB = contactPtr.GetFixtureB().GetBody();
            const BodyB_Id = getIDfromBody(BodyB);

            let HitPaddle;
            // (3) Setup data, only when the situation is about a Ball hitting Paddle object.
            if (BodyA_Id === "ball" && BodyB_Id.includes("paddle"))
            {
                (BodyB_Id === "paddle_left") ? (HitPaddle = PaddleLeft) : (HitPaddle = PaddleRight);
            } 
            else if (BodyA_Id.includes("paddle") && BodyB_Id === "ball")
            {
                (BodyA_Id === "paddle_left") ? (HitPaddle = PaddleLeft) : (HitPaddle = PaddleRight);
            } 
            else
            {
                return;
            }
            Ball.owner = HitPaddle;

            if (Ball.owner === PaddleLeft)
                console.log(`Ball hits Paddle! Ball Owner is %c${Ball.owner?.Id}`, "color:red;")
            else
                console.log(`Ball hits Paddle! Ball Owner is %c${Ball.owner?.Id}`, "color:blue;")


            // 충돌 직후 공 위치
            const ballPos = Ball.body.GetPosition();
            // 충돌 직후 공의 속도 (벡터)
            const ballVelocity = Ball.body.GetLinearVelocity();
            // x축 방향 velocity
            const velX = ballVelocity.get_x();
            // y축 방향 velocity
            const velY = ballVelocity.get_y();
            // 충돌 직후 공의 각도.
            const ballAngle = Ball.body.GetAngle();
            const paddleVelocity = HitPaddle.body.GetLinearVelocity();

            console.log(`
            paddle pos : ${HitPaddle.position.x}, ${HitPaddle.position.y}
            paddle vel : ${paddleVelocity.x}, ${paddleVelocity.y}
            ball pos : ${Ball.position.x}, ${Ball.position.y}
            ball angle : ${Ball.angle}
            `);

            // Paddle과 Ball의 위치 차이를 이용해서 공의 반사 방향 적용
            const Xdiff = HitPaddle.position.x - Ball.position.x;
            const Ydiff = HitPaddle.position.y - Ball.position.y;

            const convertRadianToDegree = (radian: number) => {
                return radian * (180 / Math.PI);
            }

            const convertDegreeToRadian = (degree: number) => {
                return degree * (Math.PI / 180);
            }

            // 공의 각도 바꾸기.
            // Ball.angle = 

            // (4) Calculate paddle and ball's velocity to apply spin.
            // https://patentimages.storage.googleapis.com/d0/d1/40/728996395938c5/KR101694296B1.pdf
        };
        this.m_World.SetContactListener(contactListener);
    }
}
