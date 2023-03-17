/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   helpers.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/26 15:41:51 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/28 21:23:22 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assert } from "./Assert";

export class Helpers {
    constructor(private readonly __box2dModule: typeof Box2D & EmscriptenModule) {}

    // Malloc space for input string and returns pointer.
    mallocString = (str: string) => {
        const { _malloc, HEAP8 /* Int8array */ } = this.__box2dModule;
        let strptr = _malloc(str.length + 1);
        let offset = 0;
        while (offset < str.length) {
            HEAP8[strptr + offset] =
                str.charCodeAt(offset); /* Emscripten function */
            offset++;
        }
        HEAP8[strptr + offset] = 0; /* Emscripten function, NULL termination */
        return strptr;
    };

    getStringFromPointer = (strPtr: number) => {
        if (strPtr === 0) {
            return "";
        }
        const { HEAP8 /* Int8array */ } = this.__box2dModule;
        let builder = "";
        let c;
        while ((c = HEAP8[strPtr++])) {
            builder += String.fromCharCode(c);
        }
        return builder;
    }

    getIDfromBodyDef = (bodyDef: Box2D.b2BodyDef): string => {
        const UserDataPtr = bodyDef.get_userData().get_pointer();
        const Body_Id = this.getStringFromPointer(UserDataPtr);
        return Body_Id;
    };

    getIDfromBody = (body: Box2D.b2Body): string => {
        const UserDataPtr = body.GetUserData().get_pointer();
        const Body_Id = this.getStringFromPointer(UserDataPtr);
        return Body_Id;
    }; 

    setIDtoBody = (body: Box2D.b2Body, newID: string) => {
        Assert.NonNullish(newID, "newID is null");

        const { _free } = this.__box2dModule;
        const OrinialId = this.getIDfromBody(body);

        if (OrinialId) 
        {   // userData already exists + setting to different value.
            if (OrinialId === newID) {
                return ; // do nothing.
            } else {
                _free(body.GetUserData().get_pointer()); // free original data.
            }
        }
        const strptr = this.mallocString(newID);
        Assert.NonNullish(strptr, "malloc failure");
        body.GetUserData().set_pointer(strptr);

        // 만약 변화가 있다면, 반드시 아래는 참이여야함.
        {
            const id = this.getIDfromBody(body);
            Assert.MustBeTrue(id !== OrinialId, "Id did not change.");
        }
    }

    setIDtoBodyDef = (bodyDef: Box2D.b2BodyDef, newID: string) => {
        const { _free } = this.__box2dModule;
        const OrinialId = this.getIDfromBodyDef(bodyDef);
        if (OrinialId) 
        {   // userData already exists + setting to different value.
            if (OrinialId === newID) {
                return ; // do nothing.
            } else {
                _free(bodyDef.userData.get_pointer()); // free original data.
            }
        }
        const strptr = this.mallocString(newID);
        Assert.NonNullish(strptr, "malloc failure");
        bodyDef.userData.set_pointer(strptr); // set new ID.
    };


    /** to replace original C++ operator = */
    copyVec2 = (vec: Box2D.b2Vec2): Box2D.b2Vec2 => {
        const { b2Vec2 } = this.__box2dModule;
        return new b2Vec2(vec.get_x(), vec.get_y());
    };

    /** to replace original C++ operator * (float) */
    scaleVec2 = (vec: Box2D.b2Vec2, scale: number): void => {
        vec.set_x(scale * vec.get_x());
        vec.set_y(scale * vec.get_y());
    };

    /** to replace original C++ operator *= (float) */
    scaledVec2 = (vec: Box2D.b2Vec2, scale: number): Box2D.b2Vec2 => {
        const { b2Vec2 } = this.__box2dModule;
        return new b2Vec2(scale * vec.get_x(), scale * vec.get_y());
    };

    // http://stackoverflow.com/questions/12792486/emscripten-bindings-how-to-create-an-accessible-c-c-array-from-javascript
    createChainShape = (
        vertices: Box2D.b2Vec2[],
        closedLoop: boolean
    ): Box2D.b2ChainShape => {
        const { _malloc, b2Vec2, b2ChainShape, HEAPF32, wrapPointer } =
            this.__box2dModule;
        const shape = new b2ChainShape();
        const buffer = _malloc(vertices.length * 8);
        let offset = 0;
        for (let i = 0; i < vertices.length; i++) {
            HEAPF32[(buffer + offset) >> 2] = vertices[i].get_x();
            HEAPF32[(buffer + (offset + 4)) >> 2] = vertices[i].get_y();
            offset += 8;
        }
        const ptr_wrapped = wrapPointer(buffer, b2Vec2);
        if (closedLoop) {
            shape.CreateLoop(ptr_wrapped, vertices.length);
        } else {
            throw new Error(
                "CreateChain API has changed in Box2D 2.4, need to update this"
            );
            // shape.CreateChain(ptr_wrapped, vertices.length);
        }
        return shape;
    };

    createPolygonShape = (vertices: Box2D.b2Vec2[]): Box2D.b2PolygonShape => {
        const { _malloc, b2Vec2, b2PolygonShape, HEAPF32, wrapPointer } =
            this.__box2dModule;
        const shape = new b2PolygonShape();
        const buffer = _malloc(vertices.length * 8);
        let offset = 0;
        for (let i = 0; i < vertices.length; i++) {
            HEAPF32[(buffer + offset) >> 2] = vertices[i].get_x();
            HEAPF32[(buffer + (offset + 4)) >> 2] = vertices[i].get_y();
            offset += 8;
        }
        const ptr_wrapped = wrapPointer(buffer, b2Vec2);
        shape.Set(ptr_wrapped, vertices.length);
        return shape;
    };

    createRandomPolygonShape = (radius: number): Box2D.b2PolygonShape => {
        const { b2Vec2 } = this.__box2dModule;
        let numVerts = 3.5 + Math.random() * 5;
        numVerts = numVerts | 0;
        const verts = [];
        for (let i = 0; i < numVerts; i++) {
            const angle = (i / numVerts) * 360.0 * 0.0174532925199432957;
            verts.push(
                new b2Vec2(radius * Math.sin(angle), radius * -Math.cos(angle))
            );
        }
        return this.createPolygonShape(verts);
    };
}
