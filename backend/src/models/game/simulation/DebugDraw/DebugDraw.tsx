/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DebugDraw.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: minkyeki <minkyeki@student.42seoul.kr>     +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/03/01 01:23:38 by minkyeki          #+#    #+#             */
/*   Updated: 2023/03/01 01:23:38 by minkyeki         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */
/*
import { useEffect, useRef }        from 'react';
import { CanvasDebugDraw }          from '../DebugDraw/debugDrawUtils';
import { Helpers }                  from '../Helpers';
import { Assert }                   from '../Assert'
import { PongSimulator }            from '../PongSimulator';

interface DebugDrawProps
{
    simulator       : PongSimulator;
    width           : number;
    height          : number;
}

export function DebugDraw( { simulator, width, height }: DebugDrawProps )
{
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        const pixelsPerMeter = 32;


        // (1) Create Canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        Assert.NonNullish(canvas, "canvas not loaded");

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        Assert.NonNullish(ctx, "ctx not loaded");

        const { b2Vec2, b2Draw: { e_shapeBit }, } = simulator.Box2dModule;
        const helperModule = new Helpers(simulator.Box2dModule);
        // const renderer = new CanvasDebugDraw(simulator.Box2dModule, helperModule, ctx, pixelsPerMeter).constructJSDraw();

        const aspectRatio = canvas.width / window.innerWidth;

        const renderer = new CanvasDebugDraw(simulator.Box2dModule, helperModule, ctx, pixelsPerMeter, aspectRatio).constructJSDraw();
        renderer.SetFlags(e_shapeBit);
        simulator.World.SetDebugDraw(renderer);

        const canvasOffset: Box2D.Point = {
            x: canvas.width / 2,
            y: canvas.height / 2,
        };
        const viewCenterPixel: Box2D.Point = {
            x: canvas.width / 2,
            y: canvas.height / 2,
        };

        const myRound = (val: number, places: number) => {
            let c = 1;
            for (let i = 0; i < places; i++) c *= 10;
            return Math.round(val * c) / c;
        };

        const getWorldPointFromPixelPoint = function(pixelPoint: Box2D.Point): Box2D.Point {
            return {
                x: (pixelPoint.x - canvasOffset.x) / pixelsPerMeter,
                y: (pixelPoint.y - (canvas.height - canvasOffset.y)) / pixelsPerMeter,
            };
        }

        const setViewCenterWorld = (
            pos: Box2D.b2Vec2,
            instantaneous: boolean
        ): void => {
            const currentViewCenterWorld =
                getWorldPointFromPixelPoint(viewCenterPixel);
            const toMoveX = pos.get_x() - currentViewCenterWorld.x;
            const toMoveY = pos.get_y() - currentViewCenterWorld.y;
            const fraction = instantaneous ? 1 : 0.25;
            canvasOffset.x -= myRound(fraction * toMoveX * pixelsPerMeter, 0);
            canvasOffset.y += myRound(fraction * toMoveY * pixelsPerMeter, 0);
        };

        setViewCenterWorld(new b2Vec2(0, 0), true);

        const drawCanvas = function () {
            Assert.NonNullish(canvas, "canvas not loaded at fn:drawCanvas()");
            Assert.NonNullish(ctx, "ctx not loaded at fn:drawCanvas()");
            ctx.fillStyle = "rgb(0,0,0)"; //black background
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvasOffset.x, canvasOffset.y);
            ctx.scale(pixelsPerMeter, -pixelsPerMeter);
            ctx.lineWidth /= pixelsPerMeter;
            ctx.fillStyle = "rgb(255,255,0)";
            simulator.World.DebugDraw(); // https://www.iforce2d.net/b2dtut/debug-draw
            ctx.restore();
        }

        let handle: number | undefined;

        // IIFE 즉시 실행 함수
        (function loop(prevMs: number) {
            const nowMs = window.performance.now();
            handle = requestAnimationFrame(loop.bind(null, nowMs));
            const deltaMs = nowMs - prevMs;
            simulator.step();
            drawCanvas();
        })(window.performance.now());

        // useEffect가 컴포넌트 destory할 때 행위를 정의.
        return () => {
            Assert.NonNullish(handle, "handle is null");
            cancelAnimationFrame(handle);
            // simulator.destroy(); --> 이건 Game에서 직접 호출.
        };

    }, []);

    return (
            <canvas 
                ref={canvasRef} 
                tabIndex={1}
            ></canvas>
    );
}*/