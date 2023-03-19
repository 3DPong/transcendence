/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RandomPolygon.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/02 00:17:43 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/06 11:41:55 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { b2PolygonObject } from './AbstractObject';

export interface RandomPolygonOptions {
    randomMaxRadius: number;
    position : Box2D.b2Vec2;
    Id?: string;
}

export class b2RandomPolygon extends b2PolygonObject
{
    constructor(
        __box2dModule: typeof Box2D & EmscriptenModule, 
        options: RandomPolygonOptions,
    ) {
        super(__box2dModule, "random_polygon");

        const { b2_dynamicBody } = this.__box2dModule;
        const { createRandomPolygonShape } = this.__helperModule;

        this.m_BodyDef.set_type(b2_dynamicBody);
        this.m_FixtureDef.set_density(100.0);
        this.m_FixtureDef.set_restitution(1.0); // 이건 충돌 후 속도 변화
        this.m_FixtureDef.set_friction(0.0); // 이 값이 0 이상일 경우 벽에 부딪히면서 반사 각이 감소.

        if (options.Id) {
            this.__helperModule.setIDtoBodyDef(this.m_BodyDef, options.Id);
        }
        this.m_BodyDef.set_position(options.position);
        const shape = createRandomPolygonShape(options.randomMaxRadius);
        this.m_FixtureDef.set_shape(shape);
        return this;
    }

    /**
     * @deprecated 생성자에서 설정하는 방식으로 변경함.
     */
    public Set(randomMaxRadius: number, position : Box2D.b2Vec2, Id?: string) 
    {
        const { createRandomPolygonShape } = this.__helperModule;

        if (Id) {
            this.__helperModule.setIDtoBodyDef(this.m_BodyDef, Id);
        }

        this.m_BodyDef.set_position(position);
        const shape = createRandomPolygonShape(randomMaxRadius);
        this.m_FixtureDef.set_shape(shape);
        return this;
    }
}