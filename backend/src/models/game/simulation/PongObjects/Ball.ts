/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Ball.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/21 04:10:07 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/06 11:53:48 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { b2Object } from './AbstractObject';
import { b2Paddle } from './Paddle';
import * as Box2D from '../../Box2D'
// https://v8.dev/features/top-level-await
// const __box2dModule : typeof Box2D & EmscriptenModule = await Box2DFactory();

export interface BallOptions {
    radius: number;
    position: Box2D.Vec2;
    Id?: string;
}

export class b2Ball extends b2Object
{
    // ball 치면 그 사람이 owner. 즉 공을 보낸 사람.
    private m_Owner: b2Paddle | null = null;

    /**
     * Create Box2d Ball object with given options (radius, position)
     * @param __box2dModule dependency module to create box2d object.
     * @param options set radius, position of the ball.
     *
     * ```
     * interface BallOptions {
     *   radius: number;
     *   position: Box2D.b2Vec2;
     *   Id?: string;
     * }
     * ```
     */
    constructor(
        options: BallOptions
    ) {
        super("ball");

        const { dynamicBody, CircleShape } = Box2D

        //this.m_BodyDef.bullet = true; cpu많이 먹음
        this.m_BodyDef.type = 
        this.m_BodyDef.set_position(options.position);

        this.m_FixtureDef.set_density(10.0);
        this.m_FixtureDef.set_restitution(1.0); // 이건 충돌 후 속도 변화
        this.m_FixtureDef.set_friction(0.0); // 이 값이 0 이상일 경우 벽에 부딪히면서 반사 각이 감소.
        const shape = new b2CircleShape();
        this.m_FixtureDef.set_shape(shape);
        shape.set_m_radius(options.radius);

        if (options.Id) {
            this.__helperModule.setIDtoBodyDef(this.m_BodyDef, options.Id);
        }
    }

    /**
     * @deprecated 
     * Set-up radius & position --> 생성자에서 설정하는 방식으로 변경함.
     */
    public Set(radius: number, position : Box2D.b2Vec2, Id?: string) 
    {
        const { b2CircleShape } = this.__box2dModule;

        if (Id) {
            this.__helperModule.setIDtoBodyDef(this.m_BodyDef, Id);
        }

        this.m_BodyDef.set_position(position);

        const shape = new b2CircleShape();
        shape.set_m_radius(radius);
        this.m_FixtureDef.set_shape(shape);
        return this;
    }

    public get radius() {
        return (this.shape.get_m_radius());
    }
    
    public set radius(radius: number) {
        this.shape.set_m_radius(radius);
    }

    public set owner(paddle: b2Paddle | null) {
        this.m_Owner = paddle;
    }

    public get owner() : b2Paddle | null {
        return this.m_Owner;
    }
}