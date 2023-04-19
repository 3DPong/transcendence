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
import 'babylonjs-loaders';
import { ArcRotateCamera, MeshBuilder, Mesh, Scene, Vector3, Color3 } from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import SceneComponent from './SceneComponent'; // uses above component in same directory
import { Assert } from '@/utils/Assert';
import React, { useEffect, useRef } from 'react';
import * as ObjectConverter from '@/components/Organism/Game/Renderer/ObjectConverter';
import * as gameType from '@/types/game';
import { useSocket } from '@/context/SocketContext';
import { Socket } from 'socket.io-client';
import { useError } from '@/context/ErrorContext';
// import PONG_LOGO_3D from '@/assets/3D_PONG.obj';
// import PONG_LOGO_3D from '@/assets/PONG_3D.gltf';
import HOCKEY_TABLE_3D from '@/assets/air_hockey_table.glb';

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
  playerData: gameType.PlayerData;
  matchData?: gameType.matchStartData;
  width: number;
  height: number;
}


// matchData가 있고, 이 데이터의 player

export function Renderer3D({ playerData, matchData, width, height }: RenderSceneProps) {
  const sceneRef = useRef<Scene | null>(null);
  const m_MeshMap: Map<gameType.objectId, BABYLON.Mesh> = new Map();

  const myScoreText = new GUI.TextBlock();
  const enemyScoreText = new GUI.TextBlock();

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
      if (matchData && matchData.playerLocation === gameType.PlayerLocation.LEFT) {
        myScoreText.text = `${scoreData.leftScore}`;
        enemyScoreText.text = `${scoreData.rightScore}`;
      } else {
        myScoreText.text = `${scoreData.rightScore}`;
        enemyScoreText.text = `${scoreData.leftScore}`;
      }
    }
    gameSocket.on('score', onScoreSentFromServer);

    return () => {
      console.log('gameSocket: [render] off');
      gameSocket.off('render', onFrameSentFromSever);
      console.log('gameSocket: [score] off');
      gameSocket.off('score', onScoreSentFromServer);
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
      return;
    } else if (matchData && matchData.gameId && gameSocket) { // if not observer
      attachGameEventToCanvas(_Canvas, gameSocket, matchData.gameId, matchData.playerLocation);
    }

    // (2) create Light, ambient light
    // (2) create Light, ambient light
    scene3D.ambientColor = new BABYLON.Color3(1, 1, 1);
    const light = new BABYLON.HemisphericLight('hemiLight', new BABYLON.Vector3(-1, 1, 0), scene3D);
    light.diffuse = new BABYLON.Color3(1, 0, 0);
    light.specular = new BABYLON.Color3(0, 1, 0);
    light.groundColor = new BABYLON.Color3(0, 1, 0);

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

    // (5-1) GUI ScoreBoard
    const ScoreTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("SCORE_GUI", true, scene3D);
    const grid = new GUI.Grid();
    // grid.background = "white";
    ScoreTexture.addControl(grid);
    grid.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;

    grid.width = "300px";
    grid.height = "100px";
    grid.addRowDefinition(0.25); // top margin
    grid.addRowDefinition(1); // 1행(프로필)
    grid.addRowDefinition(0.5); // 2행(점수)
    grid.addRowDefinition(0.25); // bottom margin
    grid.addColumnDefinition(1);
    grid.addColumnDefinition(2); // middle
    grid.addColumnDefinition(1);

    const myNickname = new GUI.TextBlock();
    myNickname.text = `${playerData.myNickName}`;
    myNickname.fontSize = 30;
    myNickname.color = "white";
    grid.addControl(myNickname, 1, 0);
    myScoreText.text = `${0}`;
    myScoreText.fontSize = 20;
    myScoreText.color = "white";
    grid.addControl(myScoreText, 2, 0);

    const enemyNickname = new GUI.TextBlock();
    enemyNickname.text = `${playerData.enemyNickName}`;
    enemyNickname.fontSize = 30;
    enemyNickname.color = "white";
    grid.addControl(enemyNickname, 1, 2);
    enemyScoreText.text = `${0}`;
    enemyScoreText.fontSize = 20;
    enemyScoreText.color = "white";
    grid.addControl(enemyScoreText, 2, 2);

    /*
    const ground = BABYLON.MeshBuilder.CreateGround("ground");
    ground.position.z = -200;
    const groundMaterial = new BABYLON.StandardMaterial("ground", scene3D);
    ground.material = groundMaterial;
    */

    function degrees_to_radians(degrees: number)
    {
      const pi = Math.PI;
      return degrees * (pi/180);
    }

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

    // TEST: 게임판 사이즈 100 x 50
    const vertexArray3D: Vector3[] = [];
    vertexArray3D.push(new Vector3(50, 25, 0));
    vertexArray3D.push(new Vector3(-50, 25, 0));
    vertexArray3D.push(new Vector3(-50, -25, 0));
    vertexArray3D.push(new Vector3(50, -25, 0));
    vertexArray3D.push(new Vector3(50, 25, 0));
    console.log(vertexArray3D);
    const lines = MeshBuilder.CreateLines(
        "Test",
        {
          points: vertexArray3D,
        },
        scene3D
    );
    lines.color = new Color3(1, 0, 0);


    // (6) create Objects using simulator's data
    if (matchData && matchData.sceneData) {
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
    }


      // (6) Start Game after 120 frame.
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

function attachGameEventToCanvas(
  canvas: HTMLCanvasElement,
  gameSocket: Socket,
  gameId: string,
  playerLocation: gameType.PlayerLocation,
) {

  let isMoveKeyDown = false;
  let isSkillKeyDown = false;

  if (playerLocation === gameType.PlayerLocation.LEFT) {
    console.log("[DEV] you are LEFT-PLAYER.");
  } else {
    console.log("[DEV] you are RIGHT-PLAYER.");
  }

  const onSkillKeyDown = (event: KeyboardEvent) => {
    if (isSkillKeyDown) return;
    let inputData: gameType.inputData;
    let keyType = gameType.inputEnum.SKILL;
    if (event.key === 'Shift') {
      inputData = {gameId: gameId, key: keyType};
      gameSocket.emit('keyInput', inputData);
      console.log("[Dev] : Skill Used");
      isSkillKeyDown = true;
    }
  }


    const onSkillKeyUp = (event: KeyboardEvent) => {
      console.log(event.key);
      if (event.key === 'Shift') {
        isSkillKeyDown = false;
      }
    }



    const onMoveKeyDown = (event: KeyboardEvent) => {
      let inputData: gameType.inputData;
      if (isMoveKeyDown) return;

      let movePaddleLeft, movePaddleRight;
      if (playerLocation === gameType.PlayerLocation.LEFT) {
        // Left Player
        movePaddleLeft = gameType.inputEnum.UP_START;
        movePaddleRight = gameType.inputEnum.DOWN_START;
      } else {
        // Right Player
        movePaddleLeft = gameType.inputEnum.DOWN_START;
        movePaddleRight = gameType.inputEnum.UP_START;
      }

      switch (event.key) {
        case 'ArrowLeft': // Move Left
          inputData = {gameId: gameId, key: movePaddleLeft};
          gameSocket.emit('keyInput', inputData);
          console.log("[Dev] : Move Left");
          isMoveKeyDown = true;
          break;
        case 'ArrowRight': // Move Right
          inputData = {gameId: gameId, key: movePaddleRight};
          gameSocket.emit('keyInput', inputData);
          console.log("[Dev] : Move Right");
          isMoveKeyDown = true;
          break;
        default: // no handling
          return;
      }
    }

    const onMoveKeyUp = (event: KeyboardEvent) => {

      let inputData: gameType.inputData;
      let movePaddleLeft, movePaddleRight;

      if (playerLocation === gameType.PlayerLocation.LEFT) {
        // Left Player
        // 왼쪽 플레이어에게 왼쪽 움직임은 위로 움직이는것과 동일.
        movePaddleLeft = gameType.inputEnum.UP_END;
        movePaddleRight = gameType.inputEnum.DOWN_END;
      } else {
        // Right Player
        movePaddleLeft = gameType.inputEnum.DOWN_END;
        movePaddleRight = gameType.inputEnum.UP_END;
      }

      switch (event.key) {
        case 'ArrowLeft': // Move Left
          inputData = {gameId: gameId, key: movePaddleLeft};
          gameSocket.emit('keyInput', inputData);
          console.log("[Dev] : Move Left Stop");
          isMoveKeyDown = false;
          break;
        case 'ArrowRight': // Move Right
          inputData = {gameId: gameId, key: movePaddleRight};
          gameSocket.emit('keyInput', inputData);
          console.log("[Dev] : Move Right Stop");
          isMoveKeyDown = false;
          break;
        default: // no handling
          return;
      }
    }
    canvas.addEventListener('keydown', onMoveKeyDown, false);
    canvas.addEventListener('keydown', onSkillKeyDown, false);
    canvas.addEventListener('keyup', onMoveKeyUp, false);
    canvas.addEventListener('keyup', onSkillKeyUp, false);
}

