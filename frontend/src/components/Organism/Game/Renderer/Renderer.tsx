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

import * as BABYLON from '@babylonjs/core';
import { ArcRotateCamera, MeshBuilder, Mesh, Scene, Vector3, Color3 } from '@babylonjs/core';
import SceneComponent from './SceneComponent'; // uses above component in same directory
import { Assert } from '@/utils/Assert';
import React, { useEffect, useRef } from 'react';
import * as ObjectConverter from '@/components/Organism/Game/Renderer/ObjectConverter';
import * as gameType from '@/types/game';
import { useSocket } from '@/context/SocketContext';
import { Socket } from 'socket.io-client';
import { convertVec2ArrayToVec3 } from './ObjectConverter';
import { useError } from '@/context/ErrorContext';

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
  matchData: gameType.matchStartData;
  width: number;
  height: number;
}

export function Renderer3D({ matchData, width, height }: RenderSceneProps) {
  const sceneRef = useRef<Scene | null>(null);
  const m_MeshMap: Map<gameType.objectId, Mesh> = new Map();
  const { gameSocket } = useSocket();
  const { handleError } = useError();

  // render each frame using data sent from server
  // https://socket.io/how-to/use-with-react
  useEffect(() => {
    if (!gameSocket) {
      handleError('gameSocket', 'gameSocket is currently null', '/');
      return;
    }
    // 변경된 친구들.
    function onFrameSentFromSever(renderDataArray: readonly gameType.renderData[]) {
      // 배열을 순회하면서 오브젝트 업데이트
      for (const objData of renderDataArray) {
        const mesh = m_MeshMap.get(objData.objectId);
        Assert.NonNullish(mesh, "object id doesn't exist");
        mesh.position = new Vector3(objData.x, objData.y, 0);
        mesh.rotation = new Vector3(0, 0, objData.angle); // only z-axis rotation
      }
    }

    gameSocket.on('render', onFrameSentFromSever);

    return () => {
      console.log('gameSocket: [render] off');
      gameSocket.off('render', onFrameSentFromSever);
    };
  }, []);

  const onSceneReady = (scene3D: Scene) => {
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
    // camera.attachControl(true);
    camera.upVector = new BABYLON.Vector3(0, 0, 1);
    const canvas = scene3D.getEngine().getRenderingCanvas();
    Assert.NonNullish(canvas, 'canvas is null');

    // (1) Attach Control
    if (!gameSocket) {
      handleError('gameSocket', 'gameSocket is currently null', '/');
      return;
    }
    attachGameEventToCanvas(_Canvas, gameSocket, matchData.gameId, matchData.playerLocation);

    // (2) create Light, ambient light
    scene3D.ambientColor = new BABYLON.Color3(1, 1, 1);
    const light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(-1, 1, 0), scene3D);
    light.diffuse = new BABYLON.Color3(1, 0, 0);
    light.specular = new BABYLON.Color3(0, 1, 0);
    light.groundColor = new BABYLON.Color3(0, 1, 0);

    // (TEST : delete later)
    // --------------------------------------------------------------
    MeshBuilder.CreateSphere(
      'LeftBall',
      {
        diameter: 5,
      },
      scene3D
    ).position = new Vector3(-20, 0, 0);

    MeshBuilder.CreateSphere(
      'RightBall',
      {
        diameter: 5,
      },
      scene3D
    ).position = new Vector3(20, 0, 0);

    const verticiesArray2D = [
      { x: 25, y: 10 },
      { x: -25, y: 10 },
      { x: -25, y: -10 },
      { x: 25, y: -10 },
    ];
    const verticiesArray3D = convertVec2ArrayToVec3(verticiesArray2D, 2);
    verticiesArray3D.push(verticiesArray3D[0]); // end cap
    const lines = MeshBuilder.CreateLines(
      'lines',
      {
        points: verticiesArray3D,
      },
      scene3D
    );
    lines.color = new Color3(1, 0, 0);
    // --------------------------------------------------------------

    const CAMERA_ANIMATION_TIME_MS = 2000;
    const TOTAL_FRAME = (CAMERA_ANIMATION_TIME_MS * 60) / 1000;
    // (3) Set up Camera via player type
    if (matchData.playerLocation === gameType.PlayerLocation.LEFT) {
      camera.spinTo('radius', 50, 60, TOTAL_FRAME);
      camera.spinTo('alpha', -Math.PI, 60, TOTAL_FRAME);
      camera.spinTo('beta', Math.PI / 2 - 0.2, 60, TOTAL_FRAME);
    } else {
      // RIGHT
      camera.spinTo('radius', 50, 60, TOTAL_FRAME);
      camera.spinTo('alpha', 0.01, 60, TOTAL_FRAME);
      camera.spinTo('beta', Math.PI / 2 - 0.2, 60, TOTAL_FRAME);
    }

    // (4) Apply color, texture, etc...

    // (5) create Objects using simulator's data
    if (!matchData.sceneData) return;
    for (const obj2D of matchData.sceneData) {
      let mesh;
      const { b2ShapeType } = gameType;
      switch (obj2D.shapeType) {
        case b2ShapeType.e_circleShape: // ball
          mesh = ObjectConverter.convertCircleToMesh(obj2D, scene3D);
          m_MeshMap.set(obj2D.objectId, mesh);
          break;
        case b2ShapeType.e_chainShape: // ground
          mesh = ObjectConverter.convertChainToLineMesh(obj2D, scene3D);
          m_MeshMap.set(obj2D.objectId, mesh);
          break;
        case b2ShapeType.e_edgeShape: // ?
          // m_MeshMap.set(obj2D, mesh)
          break;
        case b2ShapeType.e_polygonShape: // paddle, box, etc...
          mesh = ObjectConverter.convertPolygonToMesh(obj2D, scene3D);
          m_MeshMap.set(obj2D.objectId, mesh);
          break;
        default:
          console.log('no matching type');
          break;
      }

      // (6) Start Game after 120 frame.
      setTimeout(() => {
        gameSocket.emit('start');
        console.log('[DEV] : GAME START!');
      }, CAMERA_ANIMATION_TIME_MS * 1.3);
    }
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

function attachGameEventToCanvas(
  canvas: HTMLCanvasElement,
  gameSocket: Socket,
  gameId: string,
  playerLocation: gameType.PlayerLocation
) {
  let isDown = false;
  function onKeyDown(event: KeyboardEvent) {
    let inputData: gameType.inputData;
    if (isDown) return;

    let movePaddleLeft, movePaddleRight;
    if (playerLocation === gameType.PlayerLocation.LEFT) {
      // Left Player
      // 왼쪽 플레이어에게 왼쪽 움직임은 위로 움직이는것과 동일.
      movePaddleLeft = gameType.inputEnum.UP;
      movePaddleRight = gameType.inputEnum.DOWN;
    } else {
      // Right Player
      movePaddleLeft = gameType.inputEnum.DOWN;
      movePaddleRight = gameType.inputEnum.UP;
    }

    switch (event.key) {
      case 'ArrowLeft': // Move Left
        inputData = { gameId: gameId, key: movePaddleLeft };
        gameSocket.emit('keyInput', inputData);
        isDown = true;
        break;
      case 'ArrowRight': // Move Right
        inputData = { gameId: gameId, key: movePaddleRight };
        gameSocket.emit('keyInput', inputData);
        isDown = true;
        break;
      case 'Control': // Skill
        inputData = { gameId: gameId, key: gameType.inputEnum.SKILL };
        gameSocket.emit('keyInput', inputData);
        isDown = true;
        break;
      default: // no handling
        return;
    }
  }
  function onKeyUp(event: KeyboardEvent) {
    isDown = false;
  }
  canvas.addEventListener('keydown', onKeyDown, false);
  canvas.addEventListener('keyup', onKeyUp, false);
}
