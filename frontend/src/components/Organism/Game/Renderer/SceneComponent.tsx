/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SceneComponent.tsx                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/01 19:54:52 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/01 19:54:52 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import * as BABYLON from "@babylonjs/core";
import { Assert } from "@/utils/Assert";

/*************************************************************
 *  UseRef는 HTML Component (ex <canvas>, <input>...etc)
 *  에 만 전달 가능하다.
 *
 *  (1) 자식 React Component에 ref를 전달하고 정의
 *      하려면 ForwardRef를 사용해야 한다.
 *
 *  (2) 또 이 ref.current에 여러 data가 담긴 객체를 전달
 *      하고 싶다면, UseImperativeHandle을 이용해서
 *      ForwardRef와 연결시키면 된다.
 *
 **************************************************************/

export interface forwardCanvasRefHandle {
  getCanvas: () => HTMLCanvasElement;
}

declare interface SceneProps {
  antialias?: boolean | undefined;
  engineOptions?: BABYLON.EngineOptions | undefined;
  adaptToDeviceRatio?: boolean | undefined;
  sceneOptions?: BABYLON.SceneOptions | undefined;

  onRender: (scene: BABYLON.Scene) => void;
  onSceneReady: (scene: BABYLON.Scene) => void;
  width: number;
  height: number;
}

// export const SceneComponent = forwardRef<forwardCanvasRefHandle, SceneProps>(
//     (
//     { antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady, width, height },
//     forwardedCustomRef
//     ) =>
export function SceneComponent({
  antialias,
  engineOptions,
  adaptToDeviceRatio,
  sceneOptions,
  onRender,
  onSceneReady,
  width,
  height,
}: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // forwardref에 내가 원하는 객체를 전달할 수 있음. 콜백일수도, 값일수도.
  // https://beta.reactjs.org/reference/react/useImperativeHandle#usage
  // useImperativeHandle(forwardedCustomRef, () => {

  //     console.log("returning inperative handle");
  //     return {
  //         getCanvas: () => {
  //             Assert.NonNullish(canvasRef.current, "canvas null");
  //             return canvasRef.current;
  //         },
  //     };
  // });

  useEffect(() => {
    // * Hello world // https://doc.babylonjs.com/features/introductionToFeatures/chap1/first_scene
    // * React // https://doc.babylonjs.com/communityExtensions/Babylon.js+ExternalLibraries/BabylonJS_and_ReactJS

    // (0) setup canvas.
    const canvas = canvasRef.current;
    if (!canvas) return;

    // (1) setup babylon.js
    const engine = new BABYLON.Engine(canvas, antialias, engineOptions, adaptToDeviceRatio);
    const scene = new BABYLON.Scene(engine, sceneOptions);
    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene);
      scene.render();
    });

    const resize = () => {
      console.log("resizing render canvas...");
      scene.getEngine().resize();
      // const ctx = canvas.getContext("2d");
      // Assert.NonNullish(ctx, "ctx is null");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    // on element destory
    return () => {
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onRender, onSceneReady]);

  return <canvas tabIndex={1} width={width} height={height} ref={canvasRef}></canvas>;
}
// });
