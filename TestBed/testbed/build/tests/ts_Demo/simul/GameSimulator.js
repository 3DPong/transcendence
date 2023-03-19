System.register(["@box2d", "@testbed", "./object/ObjectFactory.js"], function (exports_1, context_1) {
    "use strict";
    var Box2D, testbed, ObjectFactory_js_1, PaddleState, GameSimulator, testIndex;
    var __moduleName = context_1 && context_1.id;
    function ContactListenerInit(world) {
        //  world.GetContactManager().m_contactListener.BeginContact = ()=>{};
        //  world.GetContactManager().m_contactListener.EndContact = ()=>{};
        //  world.GetContactManager().m_contactListener.PreSolve = ()=>{};
        world.GetContactManager().m_contactListener.PostSolve = function (contact, impulse) {
            console.log('call contactListener postsolve');
        };
    }
    function movePeddle(paddle, paddleState) {
        const pos = paddle.GetPosition();
        if (paddleState === PaddleState.UP) {
            if (pos.y > 23) {
                return;
            }
            paddle.SetPositionXY(pos.x, pos.y + 1);
        }
        else if (paddleState === PaddleState.DOWN) {
            if (pos.y < -23) {
                return;
            }
            paddle.SetPositionXY(pos.x, pos.y - 1);
        }
        else {
            return;
        }
    }
    return {
        setters: [
            function (Box2D_1) {
                Box2D = Box2D_1;
            },
            function (testbed_1) {
                testbed = testbed_1;
            },
            function (ObjectFactory_js_1_1) {
                ObjectFactory_js_1 = ObjectFactory_js_1_1;
            }
        ],
        execute: function () {
            (function (PaddleState) {
                PaddleState[PaddleState["UP"] = 0] = "UP";
                PaddleState[PaddleState["DOWN"] = 1] = "DOWN";
                PaddleState[PaddleState["STOP"] = 2] = "STOP";
            })(PaddleState || (PaddleState = {}));
            exports_1("PaddleState", PaddleState);
            GameSimulator = class GameSimulator extends testbed.Test {
                constructor() {
                    super();
                    //public world : Box2D.World = new Box2D.World(new Box2D.Vec2());
                    this.objectFactory = new ObjectFactory_js_1.ObjectFactory();
                    this.leftButton = PaddleState.STOP;
                    this.rightButton = PaddleState.STOP;
                    //ball create & add to world
                    this.m_world.SetGravity(new Box2D.Vec2(0, 0)); //무중력
                    this.ball = this.objectFactory.createBall(this.m_world);
                    this.objectFactory.createGround(this.m_world);
                    this.leftPaddle = this.objectFactory.createPaddle(this.m_world, -43, 0); //left
                    this.rightPaddle = this.objectFactory.createPaddle(this.m_world, 43, 0); //right
                    ContactListenerInit(this.m_world);
                    this.ball.SetLinearVelocity(new Box2D.Vec2(50, 40));
                }
                Keyboard(key) {
                    switch (key) {
                        case 'w':
                            this.leftButton = PaddleState.UP;
                            break;
                        case 's':
                            this.leftButton = PaddleState.DOWN;
                            break;
                        case 'u':
                            this.rightButton = PaddleState.UP;
                            break;
                        case 'j':
                            this.rightButton = PaddleState.DOWN;
                            break;
                    }
                }
                KeyboardUp(key) {
                    switch (key) {
                        case 'w':
                            this.leftButton = PaddleState.STOP;
                            break;
                        case 's':
                            this.leftButton = PaddleState.STOP;
                            break;
                        case 'u':
                            this.rightButton = PaddleState.STOP;
                            break;
                        case 'j':
                            this.rightButton = PaddleState.STOP;
                            break;
                    }
                }
                Step(settings) {
                    super.Step(settings);
                    if (this.leftButton !== PaddleState.STOP) {
                        movePeddle(this.leftPaddle, this.leftButton);
                    }
                    else if (this.rightButton !== PaddleState.STOP) {
                        movePeddle(this.rightPaddle, this.rightButton);
                    }
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Keys: (w) p1_up, (s) p1_down, (o) p2_up, (l) p2_down");
                    this.m_textLine += testbed.DRAW_STRING_NEW_LINE;
                }
                static Create() {
                    return new GameSimulator();
                }
            };
            exports_1("GameSimulator", GameSimulator);
            exports_1("testIndex", testIndex = testbed.RegisterTest("PingPong", "demoTest", GameSimulator.Create));
        }
    };
});
//# sourceMappingURL=GameSimulator.js.map