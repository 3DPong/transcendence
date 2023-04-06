/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.tsx                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/25 14:33:43 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/31 18:01:01 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import React, { useState, useEffect, useRef, MutableRefObject, forwardRef, RefObject, memo, useContext } from "react";

import { PongSimulator } from "@/simulation/PongSimulator";
import { DebugDraw } from "@/simulation/DebugDraw/DebugDraw";
import { Renderer3D } from "@/components/Organism/Game/Renderer/Renderer";

// https://forum.babylonjs.com/t/react-ui-babylon-js-how-to-avoid-usestate-re-rendering-canvas/35154/3
// Game Component가 계속 Rerender되는 걸 방지.
// export default React.memo(Game);

export interface GameProps {
  // gameState : GlobalContext.eGameState;
  // gameState : MutableRefObject<GlobalContext.eGameState>;
  gameRef: RefObject<any>;
  setGameState?: () => void;
}

export interface GameForwardRef {
  // gameState : GlobalContext.eGameState;
}

export function Game({ state }: any) {
  // export default function Game({gameState, setGameState}: GameProps) {

  // const gameContext = useContext(GlobalContext.gameContext);
  // UseMemo를 쓰지 않은 이유는, component destory때 simulator의 자원을 수거하기 위함.
  const [simulator, setSimulator] = useState<PongSimulator | null>(null);

  useEffect(() => {
    // On Mount
    (async () => {
      // (1) * Load Simulator
      const loadedSimulator = await new PongSimulator();
      setSimulator(loadedSimulator);
    })(/* IIFE */);

    // On Component Unmount, clean-up simulator.
    return () => {
      simulator?.destroy();
    };
  }, []);

  useEffect(() => {
    console.log("gameState changed");
  }, [state]);

  return (
    <>
      {/* <div className=" absolute -z-50 w-0 h-0"> --> [Background canvas] */}
      <div>
        {" "}
        {/* Babylon JS Renderer */}
        {simulator && <Renderer3D simulator={simulator} width={window.innerWidth} height={window.innerHeight} />}
      </div>

      {/* <div>
                {simulator && (
                    <DebugDraw simulator={simulator} width={700} height={700} />
                )}
            </div> */}
    </>
  );
}

export default React.memo(Game);
