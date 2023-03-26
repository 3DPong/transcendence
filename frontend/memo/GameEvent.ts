/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameEvent.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/02/27 03:59:23 by minkyeki          #+#    #+#             */
/*   Updated: 2023/02/28 21:53:40 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// import { PongSimulator, Ball } from "@/simulation/Simulation";
import { PongSimulator } from "@/simulation/PongSimulator";
import { b2Ball } from "@/simulation/PongObjects/Ball";

export declare interface GameEventInterface {
  onKeyDown: (event: KeyboardEvent) => void;
  onKeyUp: (event: KeyboardEvent) => void;
  onMouseMove: (event: MouseEvent) => any;
  onMouseDown: (event: MouseEvent) => any;
  onMouseUp: (event: MouseEvent) => any;
  registerToCanvas: (canvas: HTMLCanvasElement) => void;
}

export class GameEvent implements GameEventInterface {
  constructor(private readonly simulator: PongSimulator) {}

  public onKeyDown = (event: KeyboardEvent) => {
    const { b2Vec2 } = this.simulator.Box2dModule;
    switch (event.key) {
      case "ArrowUp":
        console.log("up");
        this.simulator.PaddleLeft.body.SetLinearVelocity(new b2Vec2(0, 20));
        this.simulator.PaddleRight.body.SetLinearVelocity(new b2Vec2(0, 20));
        // simulator.pushPaddle(eUserType.LEFT, new b2Vec2(0, 20));
        // this.simulator.getObjectById("paddle2").body.SetLinearVelocity(new b2Vec2(0, 20));
        // this.simulator.getObjectById("paddle3").body.SetLinearVelocity(new b2Vec2(0, 20));
        // this.simulator.getObjectById("ball1").body.SetLinearVelocity(new b2Vec2(0, 20));
        break;
      case "ArrowDown":
        console.log("down");
        this.simulator.PaddleLeft.body.SetLinearVelocity(new b2Vec2(0, -20));
        this.simulator.PaddleRight.body.SetLinearVelocity(new b2Vec2(0, -20));
        // simulator.pushPaddle(eUserType.LEFT, new b2Vec2(0, -20));
        // this.simulator.getObjectById("paddle2").body.SetLinearVelocity(new b2Vec2(0, -20));
        // this.simulator.getObjectById("paddle3").body.SetLinearVelocity(new b2Vec2(0, -20));
        // this.simulator.getObjectById("ball1").body.SetLinearVelocity(new b2Vec2(0, -20));
        break;
      case "ArrowLeft":
        this.simulator.Ball.body.SetLinearVelocity(new b2Vec2(-20, 0));
        // simulator.pushBall(new b2Vec2(-10, 0));
        // this.simulator.getObjectById("ball1").body.SetLinearVelocity(new b2Vec2(-20, 0));
        break;
      case "ArrowRight":
        // this.simulator.getObjectById("ball1").body.SetLinearVelocity(new b2Vec2(20, 0));
        break;
      case "1":
        let rand0 = Math.random();
        let rand1 = Math.random();
        let rand2 = Math.random();
        const randBall = new b2Ball(this.simulator.Box2dModule);
        randBall.Set(rand0, new b2Vec2(rand1, rand2));
        // const objectMapId = this.simulator.addObject(randBall);
        break;
      case "2":
        console.log(2);
        break;
      case "3":
        console.log(3);
        break;
      default: // no handling
        return;
    }
  };

  public onKeyUp = (event: KeyboardEvent) => {
    const { b2Vec2 } = this.simulator.Box2dModule;
    switch (event.key) {
      case "ArrowUp":
        this.simulator.PaddleLeft.body.SetLinearVelocity(new b2Vec2(0, 0));
        this.simulator.PaddleRight.body.SetLinearVelocity(new b2Vec2(0, 0));
        // this.simulator.getObjectById("paddle2").body.SetLinearVelocity(new b2Vec2(0, 0));
        // this.simulator.getObjectById("paddle3").body.SetLinearVelocity(new b2Vec2(0, 0));
        break;
        // simulator.stopPaddle(eUserType.LEFT);
        break;
      case "ArrowDown":
        this.simulator.PaddleLeft.body.SetLinearVelocity(new b2Vec2(0, 0));
        this.simulator.PaddleRight.body.SetLinearVelocity(new b2Vec2(0, 0));
        // this.simulator.getObjectById("paddle2").body.SetLinearVelocity(new b2Vec2(0, 0));
        // this.simulator.getObjectById("paddle3").body.SetLinearVelocity(new b2Vec2(0, 0));
        // simulator.stopPaddle(eUserType.LEFT);
        break;
      case "ArrowLeft":
        break;
      case "ArrowRight":
        break;
      case "1":
        console.log(1);
        break;
      case "2":
        break;
      case "3":
        break;
      default: // no handling
        return;
    }
  };

  public onMouseMove = (event: MouseEvent) => {
    //...
  };

  public onMouseDown = (event: MouseEvent) => {
    //...
  };

  public onMouseUp = (event: MouseEvent) => {
    //...
  };

  public registerToCanvas = (canvas: HTMLCanvasElement) => {
    canvas.addEventListener("keydown", this.onKeyDown, false);
    canvas.addEventListener("keyup", this.onKeyUp, false);
    // canvas.addEventListener("mousedown", this.onMouseDown, false);
    // canvas.addEventListener("mouseup", this.onMouseUp, false);
    // canvas.addEventListener("mousemove", this.onMouseMove, false);
  };
}
