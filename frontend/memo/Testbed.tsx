
import { useState, useEffect, useRef } from 'react';
import Box2DFactory from 'box2d-wasm';
import { CanvasDebugDraw } from '../src/simulation/DebugDraw/debugDrawUtils';
import { Helpers } from '../src/simulation/Helpers';
import { PongSimulationFactory, PongSimulation, eUserType } from './pongGame_old';
import { Assert } from '@/utils/Assert'
import { RenderScene } from '@/components/Game/Renderer/Renderer';

export function Testbed()
{
    const [m_Box2DModule, setBox2D] = useState<typeof Box2D & EmscriptenModule>();
    const [m_PongSimulation, setSimulation] = useState<PongSimulation | null>(null);

    useEffect(() => {
        (async () => {
            const LoadedBox2DModule = await Box2DFactory({
                locateFile: (url) => url,
            });
            /* By default, this looks for Box2D.wasm relative to public/build/bundle.js:
             * @example (url, scriptDirectory) => `${scriptDirectory}${url}`
             * But we want to look for Box2D.wasm relative to public/index.html instead. */
            setBox2D(LoadedBox2DModule);
        })(/** IIFE */);
    }, []);



    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {

        const pixelsPerMeter = 32;

        if (m_Box2DModule === undefined) { return; }
        Assert.NonNullish(m_Box2DModule, "box2d module not loaded");

        // (1) Create Canvas
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        Assert.NonNullish(canvas, "canvas not loaded");

        canvas.width = 1000;
        canvas.height = 800;
        const ctx = canvas.getContext("2d");
        Assert.NonNullish(ctx, "ctx not loaded");

        const { b2Vec2, b2Draw: { e_shapeBit }, } = m_Box2DModule;
        const helpers = new Helpers(m_Box2DModule);
        const renderer = new CanvasDebugDraw(m_Box2DModule, helpers, ctx, pixelsPerMeter).constructJSDraw();
        renderer.SetFlags(e_shapeBit);

        const canvasOffset: Box2D.Point = {
            x: canvas.width / 2,
            y: canvas.height / 2,
        };
        const viewCenterPixel: Box2D.Point = {
            x: canvas.width / 2,
            y: canvas.height / 2,
        };
        canvas.addEventListener(
            "keydown",
            function (evt) {
                onKeyDown(canvas, evt);
            },
            false
        );
        canvas.addEventListener(
            "keyup",
            function (evt) {
                onKeyUp(canvas, evt);
            },
            false
        );

        // (2) Create Simulation
        const pongSimulation = PongSimulationFactory.create(m_Box2DModule, helpers, renderer);
        setSimulation(pongSimulation);

        function onKeyDown(canvas: HTMLCanvasElement, event: KeyboardEvent) {
            console.log("key down");
            switch(event.key)
            {
            case "ArrowUp":
                pongSimulation.pushPaddle(eUserType.LEFT, new b2Vec2(0, 20));
                break;

            case "ArrowDown":
                pongSimulation.pushPaddle(eUserType.LEFT, new b2Vec2(0, -20));
                break;

            case "ArrowLeft":
                pongSimulation.pushBall(new b2Vec2(-10, 0));
                break;

            case "ArrowRight":
                break;

            default: // no handling
                return;
            }
        }

        function onKeyUp(canvas: HTMLCanvasElement, event: KeyboardEvent) {
            console.log("key up");
            switch(event.key)
            {
            case "ArrowUp":
                pongSimulation.stopPaddle(eUserType.LEFT);
                break;

            case "ArrowDown":
                pongSimulation.stopPaddle(eUserType.LEFT);
                break;

            default: // no handling
                return;
            }
        }

        const myRound = (val: number, places: number) => {
            let c = 1;
            for (let i = 0; i < places; i++) c *= 10;
            return Math.round(val * c) / c;
        };

        function getWorldPointFromPixelPoint(pixelPoint: Box2D.Point): Box2D.Point {
            return {
                x: (pixelPoint.x - canvasOffset.x) / pixelsPerMeter,
                y: (pixelPoint.y - (canvas!.height - canvasOffset.y)) / pixelsPerMeter,
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
            pongSimulation.World.DebugDraw(); // https://www.iforce2d.net/b2dtut/debug-draw
            ctx.restore();
        }

        let handle: number | undefined;

        // IIFE 즉시 실행 함수
        (function loop(prevMs: number) {
            const nowMs = window.performance.now();
            handle = requestAnimationFrame(loop.bind(null, nowMs));
            const deltaMs = nowMs - prevMs;
            pongSimulation.step(deltaMs);
            drawCanvas();
        })(window.performance.now());

        // useEffect가 컴포넌트 destory할 때 행위를 정의.
        return () => {
            Assert.NonNullish(handle, "handle is null");
            cancelAnimationFrame(handle);
            pongSimulation.destroy();
        };

    }, [m_Box2DModule]); // box2D가 로딩되면, 그때 hook 재호출.



    // 일단 Testbed에서 시뮬레이션 돌리고, 이 데이터를 그대로 babylon에 넘기는 방식으로 해보자. 
    // 나중에서는 Testbed 없이 그냥 실행할 수 있어야함.

    return (
        <div>
            {/* render if simulation loading is ready */}
            {m_PongSimulation &&  <RenderScene simulator={ m_PongSimulation } />}
            <canvas 
                ref={canvasRef} 
                tabIndex={1}
            ></canvas>
        </div>
    );
}