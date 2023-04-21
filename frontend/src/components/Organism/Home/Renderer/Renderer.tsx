/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Renderer.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/25 14:37:51 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/13 20:33:03 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */


import * as BABYLON from 'babylonjs';
import { MeshBuilder, Scene, Vector3, Color3 } from 'babylonjs';
import 'babylonjs-loaders';

import * as GUI from 'babylonjs-gui';
import SceneComponent from './SceneComponent'; // uses above component in same directory
import { Assert } from '@/utils/Assert';
import React, {useContext, useEffect, useRef} from 'react';
import * as ObjectConverter from '@/components/Organism/Game/Renderer/ObjectConverter';
import * as gameType from '@/types/game';
import { useSocket } from '@/context/SocketContext';
import { useError } from '@/context/ErrorContext';
import HOCKEY_TABLE_3D from '@/assets/air_hockey_table.glb';
import {attachGameEventToCanvas} from "@/components/Organism/Game/Renderer/KeyInput";
import GlobalContext from "@/context/GlobalContext";

// camera class for extension function
class CustomArchRotateCamera extends BABYLON.ArcRotateCamera {
  constructor(
    name: string,
    alpha: number,
    beta: number,
    radius: number,
    target: BABYLON.Vector3,
    scene?: BABYLON.Scene | undefined,
    setActiveOnSceneIfNoneActive?: boolean | undefined
  ) {
    super(name, alpha, beta, radius, target, scene, setActiveOnSceneIfNoneActive);
  }
  public spinTo(property: string, to: any, FramePerSecond: number, totalFrame: number) {
    let ease = new BABYLON.CubicEase();
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
    BABYLON.Animation.CreateAndStartAnimation(
      'at4',
      this,
      property,
      FramePerSecond,
      totalFrame,
      this[property as keyof typeof this],
      to,
      0,
      ease
    );
    console.log('camera spinTo animation');
  }
}

export interface RenderSceneProps {
  width: number;
  height: number;
}


// matchData가 있고, 이 데이터의 player

function HomeScreen3D({ width, height }: RenderSceneProps) {
  const sceneRef = useRef<Scene | null>(null);
  // const m_MeshMap: Map<gameType.objectId, BABYLON.Mesh> = new Map();
  // let m_Gui: (GUI.AdvancedDynamicTexture | undefined);
  // const {loggedUserId} = useContext(GlobalContext);


  const onSceneReady = (scene3D: Scene) => {
    // if (!loggedUserId) return;

    // (0) ** set scene to sceneRef
    sceneRef.current = scene3D;
    const _Canvas = scene3D.getEngine().getRenderingCanvas();
    if (!_Canvas) return;
    _Canvas.focus(); // 게임 화면에 포커스 설정.
    const camera = new CustomArchRotateCamera(
      'camera',
      -Math.PI / 2,
      0.01,
      150, // Distance from Target
      Vector3.Zero(),
      scene3D
    );
    camera.attachControl(true); // TODO: Delete later
    camera.inputs.attached.keyboard.detachControl(); // 카메라 키보드 반영 수정
    camera.upVector = new BABYLON.Vector3(0, 0, -1);
    const canvas = scene3D.getEngine().getRenderingCanvas();
    Assert.NonNullish(canvas, 'canvas is null');


    // (2) create Light, ambient light
    scene3D.ambientColor = new BABYLON.Color3(1, 1, 1);
    const light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(-1, 1, 0), scene3D);
    light.diffuse = new BABYLON.Color3(1, 0, 0);
    light.specular = new BABYLON.Color3(0, 1, 0);
    light.groundColor = new BABYLON.Color3(0, 1, 0);


    const vertexArray3D: Vector3[] = [];
    vertexArray3D.push(new Vector3(50, 25, 0));
    vertexArray3D.push(new Vector3(-50, 25, 0));
    vertexArray3D.push(new Vector3(-50, -25, 0));
    vertexArray3D.push(new Vector3(50, -25, 0));
    vertexArray3D.push(new Vector3(50, 25, 0));
    const lines = MeshBuilder.CreateLines(
        "Test",
        {
          points: vertexArray3D,
        },
        scene3D
    );
    lines.color = new Color3(1, 0, 0);


  }; // onSceneReady

  // https://doc.babylonjs.com/features/featuresDeepDive/animation/animation_introduction
  // const onRender = (scene: Scene) => {
  //   for (const [obj2D, mesh] of m_MeshMap.entries()) {
  //     mesh.position = new Vector3(obj2D.position.x, obj2D.position.y, 0);
  //     mesh.rotation = new Vector3(0, 0, obj2D.angle); // only z-axis rotation
  //   }
  // };

  return (
    <div>
      <SceneComponent
        antialias
        onSceneReady={onSceneReady}
        // onRender={onRender}
        width={width}
        height={height}
      />
    </div>
  );
}

export default React.memo(HomeScreen3D);