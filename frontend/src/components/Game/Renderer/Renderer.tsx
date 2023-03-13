/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Renderer.tsx                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/25 14:37:51 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/28 21:53:40 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as BABYLON from "@babylonjs/core";
import { ArcRotateCamera, Vector3, HemisphericLight, Scene, Mesh } from "@babylonjs/core";
import * as GUI from "babylonjs-gui";
import { SceneComponent, forwardCanvasRefHandle } from "./SceneComponent"; // uses above component in same directory

import { PongSimulator } from "@/simulation/PongSimulator";
import { Assert } from "@/utils/Assert";
import { b2Object } from "@/simulation/Objects";

import React, { useRef, forwardRef, useEffect } from "react";
import * as ObjectConverter from "@/components/Game/Renderer/ObjectConverter"

import * as GlobalContext from "@/components/GlobalAppContext";

export interface RenderSceneProps
{
    simulator       : PongSimulator;
    width           : number;
    height          : number;
    // gameState       : GlobalContext.eGameState;
}

export function Renderer3D( { simulator, width, height }: RenderSceneProps)
{
    // https://ko.reactjs.org/docs/forwarding-refs.html
    // const forwardedCustomRef = useRef<forwardCanvasRefHandle>(null);

    // 이거 하나 추가하니 바로 Re-render 되네;
    // const gameContext = React.useContext(GlobalContext.gameContext);
    const sceneRef = useRef<Scene | null>(null);

    /*
    useEffect(() => {
        const scene = sceneRef.current;
        if (scene) {
            console.log("inside 3D renderer: --> gameState is", gameState);
            // do anythin gwith scene and updated settingData here...
        }
    },  [ gameState ]);
    */


    // MeshMap for updating objects.
    // 2D simulator 물체와 1대1 대응하는 Mesh를 pair로 저장.
    const m_MeshMap: Map<b2Object, Mesh> = new Map();

    const onSceneReady = (scene3D: Scene) => {

        // (0) ** set scene to sceneRef
        sceneRef.current = scene3D;

        // (0) ** Connect event handler to grandchild component's canvas element.
        // if (!forwardedCustomRef.current) return;
        // const renderCanvas = forwardedCustomRef.current.getCanvas();
        const _Canvas = scene3D.getEngine().getRenderingCanvas();
        if (!_Canvas) return;
        attachGameEventToCanvas(simulator, scene3D, _Canvas);
        _Canvas.focus(); // 게임 화면에 포커스 설정.

        // (1) create Camera
        // https://doc.babylonjs.com/features/featuresDeepDive/cameras/camera_introduction#constructing-a-universal-camera
        const camera = new ArcRotateCamera(
            "camera",
            -Math.PI / 2,
            Math.PI / 2,
            50, // Distance from Target
            Vector3.Zero(),
            scene3D
        );
        camera.attachControl(true);
        const canvas = scene3D.getEngine().getRenderingCanvas();
        Assert.NonNullish(canvas, "canvas is null");


        // (2) create Light, ambient light
        scene3D.ambientColor = new BABYLON.Color3(1, 1, 1);
        const light = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(-1, 1, 0), scene3D);
        light.diffuse = new BABYLON.Color3(1, 0, 0);
        light.specular = new BABYLON.Color3(0, 1, 0);
        light.groundColor = new BABYLON.Color3(0, 1, 0);
        /*
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );
        light.intensity = 0.7;
        */

        // (3) create Objects using simulator's data
        // https://doc.babylonjs.com/communityExtensions/editor/assets/addingMeshes
        loadEvery2DSimulatorObjectsTo3DScene(scene3D);


        // (4) Apply color, texture, etc...
        const redMat = new BABYLON.StandardMaterial("redMat", scene3D);
        redMat.ambientColor = new BABYLON.Color3(1, 0, 0);

        const greenMat = new BABYLON.StandardMaterial("greenMat", scene3D);
        greenMat.ambientColor = new BABYLON.Color3(0, 1, 0);
        
        let mesh;
        mesh = m_MeshMap.get(simulator.PaddleLeft);
        if (mesh) { mesh.material = redMat; }
        mesh = m_MeshMap.get(simulator.PaddleRight);
        if (mesh) { mesh.material = greenMat; }

        // (0) GUI
        /*
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene3D);

        const button1 = GUI.Button.CreateSimpleButton("but1", "Click Me");
        button1.left = "90%";
        button1.top = "90%";
        button1.width = "150px"
        button1.height = "40px";
        button1.color = "white";
        button1.cornerRadius = 20;
        button1.background = "green";
        button1.onPointerUpObservable.add(function() {
            alert("you did it!");
        });
        advancedTexture.addControl(button1);  
        */

    };

    // https://doc.babylonjs.com/features/featuresDeepDive/animation/animation_introduction
    const onRender = (scene: Scene) => {
        // --------------------
        simulator.step();
        // --------------------
        for (const [obj2D, mesh] of m_MeshMap.entries()) {
            // if object is sleeping(aka no moving) then skip updating.
            if (!obj2D.body.IsAwake()) {
                // console.log(`${obj.Id} is sleeping. skipping position update...`);
                continue;
            }
            // update objects.
            mesh.position = new Vector3(
                obj2D.position.x,
                obj2D.position.y,
                0
            );
            mesh.rotation = new Vector3(0, 0, obj2D.angle); // only z-axis rotation
        }
    };

    const loadSingle2DObjectTo3DScene = (obj2D: b2Object, scene3D: Scene) => {
        const { b2Shape } = simulator.Box2dModule;
        let mesh;
        switch (obj2D.shapeType)
        {
            case b2Shape.e_circle: // ball
                mesh = ObjectConverter.convertCircleToMesh(obj2D, scene3D);
                m_MeshMap.set(obj2D, mesh)
                break;
            case b2Shape.e_chain: // ground
                mesh = ObjectConverter.convertChainToLineMesh(obj2D, scene3D);
                m_MeshMap.set(obj2D, mesh)
                break;
            case b2Shape.e_edge: // ?
                // m_MeshMap.set(obj2D, mesh)
                break;
            case b2Shape.e_polygon: // paddle, box, etc...
                mesh = ObjectConverter.convertPolygonToMesh(obj2D, scene3D);
                m_MeshMap.set(obj2D, mesh)
                break;
            default:
                console.log("no matching type");
                break;
        }
    }

    const loadEvery2DSimulatorObjectsTo3DScene = (scene3D: Scene) => {
        for (const obj2D of simulator.ObjectList) {
            loadSingle2DObjectTo3DScene(obj2D, scene3D);
        }
    };

    const attachGameEventToCanvas = (simulator: PongSimulator, scene3D: Scene, canvas: HTMLCanvasElement) => {
    const { b2Vec2 } = simulator.Box2dModule;
    function onKeyDown(event: KeyboardEvent) {
        switch (event.key) {
        // Player Left
            case "q":
                simulator.PaddleLeft.body.SetLinearVelocity(new b2Vec2(0, 20));
                break;
            case "a":
                simulator.PaddleLeft.body.SetLinearVelocity(new b2Vec2(0, -20));
                break;
        // Player Right
            case "e":
                simulator.PaddleRight.body.SetLinearVelocity(new b2Vec2(0, 20));
                break;
            case "d":
                simulator.PaddleRight.body.SetLinearVelocity(new b2Vec2(0,-20));
                break;
        // Ball
            case "1":
                console.log("1");
                simulator.Ball.body.SetLinearVelocity(new b2Vec2(-20, 0));
                break;
            case "2":
                simulator.Ball.body.SetLinearVelocity(new b2Vec2(20, 0));
                break;
            case "3":
                const newObj = simulator.createRandomPolygonObject(0.7, 0, 0);
                loadSingle2DObjectTo3DScene(newObj, scene3D);
                break;
            default: // no handling
                return;
        }
    }

    function onKeyUp(event: KeyboardEvent) {
        switch (event.key) {
        // Player Left
            case "q":
                simulator.PaddleLeft.body.SetLinearVelocity(new b2Vec2(0, 0));
                break;
            case "a":
                simulator.PaddleLeft.body.SetLinearVelocity(new b2Vec2(0, 0));
                break;
        // Player Right
            case "e":
                simulator.PaddleRight.body.SetLinearVelocity(new b2Vec2(0, 0));
                break;
            case "d":
                simulator.PaddleRight.body.SetLinearVelocity(new b2Vec2(0, 0));
                break;
        // Ball
            case "0":
                break;
            case "1":
                break;
            case "2":
                break;
            default: // no handling
                return;
        }
    }

    canvas.addEventListener("keydown", onKeyDown, false);
    canvas.addEventListener("keyup", onKeyUp, false);
};

    return (
        <div>
            <SceneComponent
                // ref = {forwardedCustomRef}
                antialias
                onSceneReady={onSceneReady}
                onRender={onRender}
                width={width}
                height={height}
            />
        </div>
    );
}


