/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AbstractObject.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/21 04:10:07 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/28 21:49:20 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assert } from '@/utils/Assert';
import { Helpers } from '@/simulation/Helpers';

// bodyDef, FixtureDef 모음집.
abstract class ObjectBase
{
    protected  m_BodyDef     : Box2D.b2BodyDef;
    protected  m_FixtureDef  : Box2D.b2FixtureDef;
    protected __helperModule : Helpers;

    constructor ( 
        protected readonly __box2dModule: typeof Box2D & EmscriptenModule, 
        BaseID : string 
    ) {
        const { b2BodyDef, b2FixtureDef } = this.__box2dModule;
        this.__helperModule = new Helpers(this.__box2dModule);

        this.m_BodyDef = new b2BodyDef();
        this.m_FixtureDef = new b2FixtureDef();
        this.__helperModule.setIDtoBodyDef(this.m_BodyDef, BaseID);
    }

    public abstract RegisterTo(world: Box2D.b2World): void;
}

export abstract class b2Object extends ObjectBase {
    protected m_Fixture: Box2D.b2Fixture | null = null;

    constructor ( 
        __box2dModule: typeof Box2D & EmscriptenModule, 
        BaseID: string,
    ) {
        super( __box2dModule, BaseID);
    }

    public get body() {
        Assert.NonNullish(this.m_Fixture, "m_Fixture is null");
        return this.m_Fixture.GetBody();
    }

    public get shape() {
        Assert.NonNullish(this.m_Fixture, "m_Fixture is null");
        return this.m_Fixture.GetShape();
    }

    public get Id(): string {
        return this.__helperModule.getIDfromBody(this.body);
    }

    public get position() {
        return this.body.GetPosition();
    }

    // get object type : b2CircleShape, b2PolygonShape ...etc
    public get shapeType() {
        return this.shape.get_m_type();
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

    public RegisterTo(world: Box2D.b2World) {
        console.log("Object : registerTo() called");
        this.m_Fixture = world
            .CreateBody(this.m_BodyDef)
            .CreateFixture(this.m_FixtureDef);
        return this; // for object chaining.
    }

    // Object Destructor : https://www.iforce2d.net/b2dtut/removing-bodies
    public destory() {
        const { _free } = this.__box2dModule;
        const __bodyDataptr__ = this.body.GetUserData().get_pointer();
        
        if (__bodyDataptr__) {
            _free(__bodyDataptr__);
        }
        if (this.body) {
            this.body.GetWorld().DestroyBody(this.body); // World로 부터 body 제거.
        }
    }
}

export abstract class b2ChainObject extends b2Object
{
    protected m_ChainShape : Box2D.b2ChainShape | null = null;
    protected m_ChainVerticies : Box2D.b2Vec2[] = [];

    constructor(
        __box2dModule: typeof Box2D & EmscriptenModule, 
        id: string
    ) {
        super(__box2dModule, id);
    }

    // https://box2d.org/documentation/md__d_1__git_hub_box2d_docs_collision.html#autotoc_md40
    public getChainVertices() 
    {
        // Ground는 잠시 보류. 
        // const { _malloc, castObject, b2ChainShape, b2EdgeShape } = this.__box2dModule;
        // const shape = castObject(this.shape, b2ChainShape);

        // const vc = shape.get_m_count();
        // console.log(vc);
        // let verticiesArray: Box2D.b2Vec2[] = [];
        // const buffer = _malloc(vc * 8);
        // for (let i = 0; i < shape.get_m_count(); ++i) {
            // let edge : Box2D.b2EdgeShape;
            // shape.GetChildEdge()
            // shape.GetChildEdge()
        // }

        // let vec2;
        // while (vec2 = shape.get_m_nextVertex() && ) {
            // console.log("chain vertex", vec2.x, vec2.y);
        // }
        // verticiesArray.push(vec2);
        // return verticiesArray;
        return this.m_ChainVerticies;
    }
}

export abstract class b2PolygonObject extends b2Object 
{
    // protected m_ChainShape : Box2D.b2ChainShape | null = null;

    constructor(
        __box2dModule: typeof Box2D & EmscriptenModule, 
        id: string
    ) {
        super(__box2dModule, id);
    }

    public getPolygonVertices() 
    {
        const { castObject, b2PolygonShape } = this.__box2dModule;
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

// 고정 과표계 이동만 가능한 객체.
export abstract class b2PrismaticJointedObject extends b2PolygonObject
{
    protected m_Joint               : Box2D.b2Joint | null = null;
    protected m_JointDef            : Box2D.b2PrismaticJointDef;
    protected m_RestraintBodyDef    : Box2D.b2BodyDef;
    protected m_JointAxis           : Box2D.b2Vec2; // temp data

    constructor(
        __box2dModule: typeof Box2D & EmscriptenModule, 
        id : string
    ) {
        super(__box2dModule, id);

        const {
            b2Vec2,
            b2BodyDef,
            b2PrismaticJointDef,
        } = this.__box2dModule;

        this.m_JointDef = new b2PrismaticJointDef();
        this.m_RestraintBodyDef = new b2BodyDef();
        this.m_JointAxis = new b2Vec2(1, 0);
    }
}