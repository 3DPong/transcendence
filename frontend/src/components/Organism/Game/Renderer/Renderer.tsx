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
import * as MATERIAL from 'babylonjs-materials';
import * as GUI from 'babylonjs-gui';
import SceneComponent from './SceneComponent'; // uses above component in same directory
import { Assert } from '@/utils/Assert';
import React, { useEffect, useRef } from 'react';
import * as ObjectConverter from '@/components/Organism/Game/Renderer/ObjectConverter';
import * as gameType from '@/types/game';
import { useSocket } from '@/context/SocketContext';
import { useError } from '@/context/ErrorContext';
import HOCKEY_TABLE_3D from '@/assets/air_hockey_table.glb';
import {attachGameEventToCanvas} from "@/components/Organism/Game/Renderer/KeyInput";

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
  playerData?: gameType.PlayerData;
  matchData?: gameType.matchStartData;
  width: number;
  height: number;
}


// matchData가 있고, 이 데이터의 player

function Renderer3D({ playerData, matchData, width, height }: RenderSceneProps) {
  const sceneRef = useRef<Scene | null>(null);
  const m_MeshMap: Map<gameType.objectId, BABYLON.Mesh> = new Map();
  let m_Gui: (GUI.AdvancedDynamicTexture | undefined);

  const { gameSocket } = useSocket();
  const { handleError } = useError();

  // render each frame using data sent from server
  // https://socket.io/how-to/use-with-react

  useEffect(() => {
    if (!matchData) return; // if '/develop'
    if (!gameSocket) {
      console.log("[DEV] error! gameSocket is null");
      handleError('gameSocket', 'gameSocket is currently null', '/');
      return;
    }

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



    function onScoreSentFromServer(scoreData: gameType.scoreData) {
      // 스코어보드 업데이트.
      console.log(`[DEV] gameScore --> LEFT:${scoreData.leftScore} RIGHT:${scoreData.rightScore}`);
      if (m_Gui) {
        let UserA_Score = m_Gui.getControlByName('UserA_Score') as GUI.TextBlock;
        let UserB_Score = m_Gui.getControlByName('UserB_Score') as GUI.TextBlock;
        if (matchData && matchData.playerLocation === gameType.PlayerLocation.LEFT) {
          UserA_Score.text = `${scoreData.leftScore}`;
          UserB_Score.text = `${scoreData.rightScore}`;
        } else {
          UserA_Score.text = `${scoreData.rightScore}`;
          UserB_Score.text = `${scoreData.leftScore}`;
        }
      }
    }
    gameSocket.on('score', onScoreSentFromServer);

    return () => {
      console.log('gameSocket: [render] off');
      gameSocket.off('render', onFrameSentFromSever);
      console.log('gameSocket: [score] off');
      gameSocket.off('score', onScoreSentFromServer);
      console.log('Player has closed the game.');
      gameSocket.emit('exit'); // 화면을 나가게 되면 그때 exit 신호를 보내야 함.
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
    camera.attachControl(true); // TODO: Delete later
    camera.inputs.attached.keyboard.detachControl(); // 카메라 키보드 반영 수정
    camera.upVector = new BABYLON.Vector3(0, 0, -1);
    const canvas = scene3D.getEngine().getRenderingCanvas();
    Assert.NonNullish(canvas, 'canvas is null');

    // (1) Attach Control
    if (matchData && !gameSocket) {
      handleError('gameSocket', 'gameSocket is currently null', '/');
      return ;
    } else if (matchData && matchData.gameId && gameSocket) { // if not observer
      attachGameEventToCanvas(_Canvas, gameSocket, matchData.gameId, matchData.playerLocation);
    }

    // Create Ground for Shadow
    // (2) create Light, ambient light
    scene3D.ambientColor = new BABYLON.Color3(1, 1, 1); // White

    var light = new BABYLON.DirectionalLight("light", new BABYLON.Vector3(0, 0, 1), scene3D);
    light.intensity = 0.7;
    light.position = new BABYLON.Vector3(5, 5, -5);
    light.diffuse = new BABYLON.Color3(1, 1, 1);
    light.specular = new BABYLON.Color3(1, 1, 1);

    const light0 = new BABYLON.HemisphericLight("light0", new BABYLON.Vector3(0, 1, 0), scene3D);
    light0.intensity = 0.25;

    const sg = new BABYLON.ShadowGenerator(1024, light);
    sg.enableSoftTransparentShadow = false;
    sg.blurBoxOffset = 4;


    function degrees_to_radians(degrees: number)
    {
      const pi = Math.PI;
      return degrees * (pi/180);
    }

    // create Ground for shadow
    /*
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene3D);

    ground.rotation = new Vector3(degrees_to_radians(-90), 0, 0);
    ground.position = new Vector3(0, 0, 3);
    ground.material = new MATERIAL.ShadowOnlyMaterial('mat', scene3D);
    ground.receiveShadows = true;
    */

    if (playerData && matchData) {
      const importPromise = BABYLON.SceneLoader.ImportMeshAsync(null, HOCKEY_TABLE_3D, '', scene3D);
      importPromise.then((result) => {
        const table = new BABYLON.TransformNode("Table");
        result.meshes.forEach(mesh => {
          if (!mesh.parent) {
            mesh.parent = table;
          }
        });
        table.position = new Vector3(-20, -160, 38);
        table.rotation = new Vector3(degrees_to_radians(-90), 0, 0);
        table.scaling = new Vector3(0.43, 0.43, 0.43);
      });
    }

    // (6) create Objects using simulator's data
    if (matchData && matchData.sceneData) {
      for (const obj2D of matchData.sceneData) {
        let mesh: BABYLON.Mesh
        const {b2ShapeType} = gameType;
        switch (obj2D.shapeType) {
          case b2ShapeType.e_circleShape: // ball
            mesh = ObjectConverter.convertCircleToMesh(obj2D, scene3D);
            m_MeshMap.set(obj2D.objectId, mesh);
            sg.addShadowCaster(mesh);
            break;
          case b2ShapeType.e_chainShape: // ground
            mesh = ObjectConverter.convertChainToLineMesh(obj2D, scene3D);
            m_MeshMap.set(obj2D.objectId, mesh);
            sg.addShadowCaster(mesh);
            break;
          case b2ShapeType.e_polygonShape: // paddle, box, etc...
            mesh = ObjectConverter.convertPolygonToMesh(obj2D, scene3D);
            m_MeshMap.set(obj2D.objectId, mesh);
            sg.addShadowCaster(mesh);
            break;
          default:
            console.log('no matching type');
            break;
        }
      }
    }



    // (3) Set up Camera via player type
    const CAMERA_ANIMATION_TIME_MS = 3000;
    const CAMERA_TILT_ANGLE = 60;
    const TOTAL_FRAME = (CAMERA_ANIMATION_TIME_MS * 60) / 1000;
    if (matchData && (matchData.playerLocation === gameType.PlayerLocation.LEFT)) {
      camera.spinTo('radius', 120, 60, TOTAL_FRAME);
      camera.spinTo('alpha', -Math.PI, 60, TOTAL_FRAME);
      camera.spinTo('beta', Math.PI / 180 * CAMERA_TILT_ANGLE, 60, TOTAL_FRAME);
    } else if (matchData && (matchData.playerLocation === gameType.PlayerLocation.RIGHT)) { // RIGHT
      camera.spinTo('radius', 120, 60, TOTAL_FRAME);
      camera.spinTo('alpha', 0.001, 60, TOTAL_FRAME);
      camera.spinTo('beta', Math.PI / 180 * CAMERA_TILT_ANGLE, 60, TOTAL_FRAME);
    } else {
      // ...  Observer ...
    }


    // (5-1) Load GUI
    if (playerData && matchData) {
      console.log(playerData);
      m_Gui = GUI.AdvancedDynamicTexture.CreateFullscreenUI("SCORE_GUI", true, scene3D);
      (async () => {
        // https://gui.babylonjs.com/#7YQSCB#2
        await m_Gui.parseFromSnippetAsync("7YQSCB#3", false)
        let UserA_Nickname = m_Gui.getControlByName('UserA_Nickname') as GUI.TextBlock;
        UserA_Nickname.text = `${playerData.myNickName}`
        let UserA_Score = m_Gui.getControlByName('UserA_Score') as GUI.TextBlock;
        UserA_Score.text = `${0}`;
        let UserB_Nickname = m_Gui.getControlByName('UserB_Nickname') as GUI.TextBlock;
        UserB_Nickname.text = `${playerData.enemyNickName}`
        let UserB_Score = m_Gui.getControlByName('UserB_Score') as GUI.TextBlock;
        UserB_Score.text = `${0}`;
      })(/* IIFE */);
    }




    // (6) Start Game after 120 frame.
    if (matchData) {
      console.log("Game Starting in ", CAMERA_ANIMATION_TIME_MS + 1000)
      const readyTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("COUNT_GUI", true, scene3D);
      const readyText = new GUI.TextBlock();
      readyText.text = "";
      readyText.fontSize = 50;
      readyText.color = "white";
      readyTexture.addControl(readyText);
      let MS = CAMERA_ANIMATION_TIME_MS + 2000;
      const ID = setInterval(() => {
        if (MS === 2000) readyText.text = "Ready"
        else if (MS === 1000) readyText.text = "Go!"
        else if (MS <= 500) {
          readyText.dispose();
          clearInterval(ID);
        }
        MS -= 500;
      }, 500);

      if (gameSocket) {
        setTimeout(() => {
          gameSocket.emit('start');
          console.log('[DEV] : GAME START!');
        }, CAMERA_ANIMATION_TIME_MS + 2000);
      }
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

export default React.memo(Renderer3D);