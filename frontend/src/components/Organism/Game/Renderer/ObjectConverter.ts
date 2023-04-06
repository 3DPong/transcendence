/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ObjectConverter.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/01 14:53:17 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/01 23:45:50 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { b2ChainObject, b2Object } from "@/simulation/PongObjects/AbstractObject";
import { Vector3, MeshBuilder, Scene, PolygonMeshBuilder, Mesh, Color3, Color4 } from "@babylonjs/core";
import { b2Ball, b2PolygonObject } from "@/simulation/Objects";
import Box2DFactory from "box2d-wasm";


// precision이 2면 소수점 두자리수로 잘라줌.
export const floatPrecision = (x: number, precision: number) => {
    const DELTA = 10 ** precision;
    return Math.round((x + Number.EPSILON) * DELTA) / DELTA;
}

export const convertVec2ArrayToVec3 = (vec2Arr: readonly Box2D.b2Vec2[], _floatPrecision: number) => {
    const verticiesArray3D: Vector3[] = [];
    for (const v of vec2Arr) {
        const x = floatPrecision(v.x, _floatPrecision);
        const y = floatPrecision(v.y, _floatPrecision);
        verticiesArray3D.push( new Vector3(x, y, 0) );
    }
    return verticiesArray3D;
}


export const convertChainToLineMesh = (obj: b2Object, scene: Scene) => {
    const chain = <b2ChainObject>(obj);
    const verticiesArray2D = chain.getChainVertices();
    for (let v of verticiesArray2D) {
        console.log(v.x, v.y);
    }
    const verticiesArray3D = convertVec2ArrayToVec3(verticiesArray2D, 2);
    verticiesArray3D.push(verticiesArray3D[0]); // end cap
    const lines = MeshBuilder.CreateLines("lines", {
        points: verticiesArray3D,
    }, scene);
    lines.color = new Color3(1, 0, 0);
    return lines;
}

// Safe type cast? // https://dev.to/ylerjen/typescript-cast-is-a-type-breaker-1jbh
export const convertCircleToMesh = (obj: b2Object, scene: Scene) => {
    const ball = <b2Ball>(obj);
    const mesh = MeshBuilder.CreateSphere(
        obj.Id,
        {
            diameter: ball.radius * 2,
        },
        scene
    ); // MeshBuilder가 scene에 추가해줌.
    // https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/center_origin/rotation
    mesh.position = new Vector3(ball.position.x, ball.position.y, 0);
    mesh.rotation = new Vector3(0, 0, ball.angle); // only z-axis rotation
    return mesh;
};

export const convertPolygonToMesh = (obj: b2Object, scene: Scene) => {
    const polygon = <b2PolygonObject>(obj);
    const verticiesArray2D = polygon.getPolygonVertices();
    const verticiesArray3D = convertVec2ArrayToVec3(verticiesArray2D, 2)
    const EXTRUDE_DEPTH = 1; // 양방향 extrude 길이.

    const extrudePath = [
        new Vector3(0, 0, -EXTRUDE_DEPTH),
        new Vector3(0, 0, EXTRUDE_DEPTH),
    ];
    const mesh = MeshBuilder.ExtrudeShape(
        obj.Id,
        {
            shape: verticiesArray3D,
            path: extrudePath,
            updatable: true,
            closeShape: true,
            cap: Mesh.CAP_ALL,
        },
        scene
    );
    mesh.position = new Vector3(polygon.position.x, polygon.position.y, 0);
    mesh.rotation = new Vector3(0, 0, polygon.angle); // only z-axis rotation
    return mesh;
}