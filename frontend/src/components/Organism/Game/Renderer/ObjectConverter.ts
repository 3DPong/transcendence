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

import { Vector3, MeshBuilder, Scene, PolygonMeshBuilder, Mesh, Color3, Color4 } from '@babylonjs/core';
import * as gameTypes from '@/types/game';
import { Assert } from '@/utils/Assert';

// precision이 2면 소수점 두자리수로 잘라줌.
export const floatPrecision = (x: number, precision: number) => {
  const DELTA = 10 ** precision;
  return Math.round((x + Number.EPSILON) * DELTA) / DELTA;
};

export const convertVec2ArrayToVec3 = (vec2Arr: readonly gameTypes.Vec2[], _floatPrecision: number) => {
  const vertexArray3D: Vector3[] = [];
  for (const v of vec2Arr) {
    const x = floatPrecision(v.x, _floatPrecision);
    const y = floatPrecision(v.y, _floatPrecision);
    vertexArray3D.push(new Vector3(x, y, 0));
  }
  return vertexArray3D;
};

export const convertChainToLineMesh = (obj: gameTypes.objectData, scene: Scene) => {
  const vertexArray2D = obj.vertex;
  Assert.NonNullish(vertexArray2D);
  const vertexArray3D = convertVec2ArrayToVec3(vertexArray2D, 2);
  vertexArray3D.push(vertexArray3D[0]); // end cap
  const lines = MeshBuilder.CreateLines(
    obj.objectId,
    {
      points: vertexArray3D,
    },
    scene
  );
  lines.color = new Color3(1, 0, 0);
  return lines;
};

// Safe type cast? // https://dev.to/ylerjen/typescript-cast-is-a-type-breaker-1jbh
export const convertCircleToMesh = (obj: gameTypes.objectData, scene: Scene) => {
  Assert.NonNullish(obj.radius);
  const mesh = MeshBuilder.CreateSphere(
    obj.objectId,
    {
      diameter: obj.radius * 2,
    },
    scene
  ); // MeshBuilder가 scene에 추가해줌.
  // https://doc.babylonjs.com/features/featuresDeepDive/mesh/transforms/center_origin/rotation
  mesh.position = new Vector3(obj.x, obj.y, 0);
  mesh.rotation = new Vector3(0, 0, obj.angle); // only z-axis rotation
  return mesh;
};

export const convertPolygonToMesh = (obj: gameTypes.objectData, scene: Scene) => {
  const verticesArray2D = obj.vertex;
  Assert.NonNullish(verticesArray2D);
  const verticesArray3D = convertVec2ArrayToVec3(verticesArray2D, 2);
  const EXTRUDE_DEPTH = 1; // 양방향 extrude 길이.

  const extrudePath = [new Vector3(0, 0, -EXTRUDE_DEPTH), new Vector3(0, 0, EXTRUDE_DEPTH)];
  const mesh = MeshBuilder.ExtrudeShape(
    obj.objectId,
    {
      shape: verticesArray3D,
      path: extrudePath,
      updatable: true,
      closeShape: true,
      cap: Mesh.CAP_ALL,
    },
    scene
  );
  mesh.position = new Vector3(obj.x, obj.y, 0);
  mesh.rotation = new Vector3(0, 0, obj.angle); // only z-axis rotation
  return mesh;
};
