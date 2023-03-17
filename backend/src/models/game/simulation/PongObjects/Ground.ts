/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Ground.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/21 04:10:07 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/06 11:55:09 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assert } from '../Assert';
import { b2ChainObject } from './AbstractObject';

// https://v8.dev/features/top-level-await

export interface GroundOptions {
    width: number;
    height: number;
    position: Box2D.b2Vec2;
    Id?: string;
}


export class b2Ground extends b2ChainObject {
    /**
     * @param __box2dModule depedency module to create box2d object.
     * @param options 
     *
     * ```
     * interface GroundOptions {
     *    width: number;
     *    height: number;
     *    position: Box2D.b2Vec2;
     *    Id?: string;
     * }
     * ```
     */
    constructor(
        __box2dModule: typeof Box2D & EmscriptenModule,
        options: GroundOptions
    ) {
        super(__box2dModule, "ground");

        const { b2_staticBody } = this.__box2dModule;
        const { createChainShape } = this.__helperModule;

        this.m_BodyDef.set_type(b2_staticBody);

        const { b2Vec2 } = this.__box2dModule;

        if (options.Id) {
            this.__helperModule.setIDtoBodyDef(this.m_BodyDef, options.Id);
        }
        const w_delta = options.width / 2;
        const h_delta = options.height / 2;
        const X = options.position.get_x();
        const Y = options.position.get_y();

        const cageVerts = [];
        cageVerts[0] = new b2Vec2(-w_delta, Y + h_delta);
        cageVerts[1] = new b2Vec2(X + w_delta, Y + h_delta);
        cageVerts[2] = new b2Vec2(X + w_delta, Y - h_delta);
        cageVerts[3] = new b2Vec2(X - w_delta, Y - h_delta);
        this.m_ChainShape = createChainShape(cageVerts, true);
        this.m_ChainVerticies = cageVerts;
        return this;
    }

    /**
     * @deprecated 이제 생성자에서 options parameter로 설정하는 방식을 쓸 것.
     */
    public Set(
        width: number,
        height: number,
        position: Box2D.b2Vec2,
        Id?: string
    ) {
        const { b2Vec2 } = this.__box2dModule;

        if (Id) {
            this.__helperModule.setIDtoBodyDef(this.m_BodyDef, Id);
        }

        const { createChainShape } = this.__helperModule;

        const w_delta = width / 2;
        const h_delta = height / 2;
        const X = position.get_x();
        const Y = position.get_y();

        const cageVerts = [];
        cageVerts[0] = new b2Vec2(-w_delta, Y + h_delta);
        cageVerts[1] = new b2Vec2(X + w_delta, Y + h_delta);
        cageVerts[2] = new b2Vec2(X + w_delta, Y - h_delta);
        cageVerts[3] = new b2Vec2(X - w_delta, Y - h_delta);
        this.m_ChainShape = createChainShape(cageVerts, true);
        this.m_ChainVerticies = cageVerts;
        return this;
    }

    public override RegisterTo(world: Box2D.b2World): this {
        console.log("Ground : registerTo() called");
        Assert.NonNullish(
            this.m_ChainShape,
            "chainShape is null. Use setAsBox() function first."
        );
        Assert.NonNullish(this.m_BodyDef, "bodyDef is null");
        this.m_Fixture = world
            .CreateBody(this.m_BodyDef)
            .CreateFixture(this.m_ChainShape, 0.0);

        return this;
    }
}