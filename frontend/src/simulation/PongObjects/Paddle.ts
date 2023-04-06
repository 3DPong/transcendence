/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Paddle.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/21 04:10:07 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/06 11:58:50 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { b2PrismaticJointedObject } from './AbstractObject';
import { Assert } from '@/utils/Assert';

export interface PaddleOptions {
    position: Box2D.b2Vec2;
    size: Box2D.b2Vec2;
    jointControlPoint: Box2D.b2Vec2;
    jointAxis: Box2D.b2Vec2;
    Id?: string;
}

// 고정 과표계 이동만 가능한 객체.
export class b2Paddle extends b2PrismaticJointedObject {
    /**
     *
     * @param __box2dModule dependency module for creating box2d object.
     * @param options
     *
     * ```
     * export interface PaddleOptions {
     *    position: Box2D.b2Vec2; // paddle의 위치
     *    size: Box2D.b2Vec2; // paddle 직사각형의 가로 세로 길이
     *    jointControlPoint: Box2D.b2Vec2; // 축의 고정점. 고정점에 물체가 충돌할 수 있음으로 ground의 바깥영역으로 설정할 것
     *    jointAxis: Box2D.b2Vec2; // Paddle의 이동축 지정
     *    Id?: string;
     * }
     * ```
     */
    constructor(
        __box2dModule: typeof Box2D & EmscriptenModule,
        options: PaddleOptions
    ) {
        super(__box2dModule, "paddle");

        const { b2Vec2, b2_dynamicBody, b2PolygonShape } = this.__box2dModule;

        this.m_FixtureDef.set_density(1000.0);
        this.m_FixtureDef.set_friction(0.3);
        this.m_FixtureDef.set_restitution(0.8);

        this.m_BodyDef.set_type(b2_dynamicBody);

        // TODO: set-up default paddle size.
        this.m_JointDef.collideConnected = false;
        this.m_JointDef.enableMotor = true;
        this.m_JointDef.maxMotorForce = 3;

        if (options.Id) {
            this.__helperModule.setIDtoBodyDef(this.m_BodyDef, options.Id);
        }
        // (0) Paddle position
        this.m_BodyDef.set_position(
            new b2Vec2(options.position.get_x(), options.position.get_y())
        );
        // (1) Paddle shape
        const shape = new b2PolygonShape();
        shape.SetAsBox(options.size.get_x(), options.size.get_y());
        this.m_FixtureDef.set_shape(shape);
        // (2) Restraints position
        this.m_RestraintBodyDef.set_position(options.jointControlPoint);
        // (3) Joint axis
        this.m_JointAxis = options.jointAxis;
    }

    /**
     * @deprecated 생성자에서 설정하는 방식으로 변경함.
     */
    public Set(
        position: Box2D.b2Vec2,
        size: Box2D.b2Vec2,
        jointControlPoint: Box2D.b2Vec2,
        jointAxis: Box2D.b2Vec2,
        Id?: string
    ) {
        const { b2Vec2, b2PolygonShape } = this.__box2dModule;

        if (Id) {
            this.__helperModule.setIDtoBodyDef(this.m_BodyDef, Id);
        }

        // (0) Paddle position
        this.m_BodyDef.set_position(
            new b2Vec2(position.get_x(), position.get_y())
        );

        // (1) Paddle shape
        const shape = new b2PolygonShape();
        shape.SetAsBox(size.get_x(), size.get_y());
        this.m_FixtureDef.set_shape(shape);

        // (2) Restraints position
        this.m_RestraintBodyDef.set_position(jointControlPoint);

        // (3) Joint axis
        this.m_JointAxis = jointAxis;

        return this;
    }

    public override RegisterTo(world: Box2D.b2World): this {
        const { b2EdgeShape, b2Vec2 } = this.__box2dModule;

        // (1) 일단 기존 box부터 world에 붙이고, 그 이후에 진행.
        super.RegisterTo(world); // create and set Polygon body

        // (2) setUp Paddle Body to restraint
        const edge = new b2EdgeShape();
        const restraintFixture = world
            .CreateBody(this.m_RestraintBodyDef)
            .CreateFixture(edge, 0.0);

        const bodyA = restraintFixture.GetBody();
        const bodyB = this.body;
        const anchor = new b2Vec2(0, 0);
        const axis = this.m_JointAxis;

        // (3) Joint를 world에 붙이면 끝.
        this.m_JointDef.Initialize(bodyA, bodyB, anchor, axis);
        this.m_Joint = world.CreateJoint(this.m_JointDef);
        return this;
    }

    // 축을 바꾸거나, 속성을 바꾸고 싶을때 사용.
    public get joint() {
        Assert.NonNullish(this.m_Joint, "Joint is null");
        return this.m_Joint;
    }

    public override destory(): void {
        if (this.m_Joint) this.body.GetWorld().DestroyJoint(this.m_Joint);
        super.destory(); // destory body, Id
    }
}