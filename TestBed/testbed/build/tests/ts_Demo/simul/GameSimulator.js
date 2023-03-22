System.register(["@box2d", "@testbed", "../gameEnv/GameEnv.js", "./GameEnum.js", "./GameUser.js", "./object/ObjectFactory.js"], function (exports_1, context_1) {
    "use strict";
    var Box2D, testbed, GameEnv_js_1, GameEnum_js_1, GameUser_js_1, ObjectFactory_js_1, GameSimulator, testIndex;
    var __moduleName = context_1 && context_1.id;
    function BallSpeedCorrection(ball, speed) {
        const afterVelocity = speed;
        const beforeVelocity = ball.GetLinearVelocity().LengthSquared();
        const vel = ball.GetLinearVelocity().Clone();
        const coefficient = Math.sqrt(afterVelocity / beforeVelocity);
        ball.SetLinearVelocity(new Box2D.Vec2(vel.x * coefficient, vel.y * coefficient));
    }
    function ContactListenerInit(world) {
        //  world.GetContactManager().m_contactListener.BeginContact = ()=>{};
        //  world.GetContactManager().m_contactListener.EndContact = ()=>{};
        //충돌 직전 콜 되는 이벤트, score확인
        world.GetContactManager().m_contactListener.PreSolve = function (contact, oldManifold) {
            const Ashape = contact.GetFixtureA();
            const Bshape = contact.GetFixtureB();
            const ball = Ashape.GetUserData() === "ball" ? Ashape.GetBody() : Bshape.GetBody();
            const newManifold = contact.GetManifold();
            if (newManifold.localPoint.x === GameEnv_js_1.MAP_WIDTH && newManifold.localPoint.y === GameEnv_js_1.MAP_HEIGHT) {
                ++ball.GetUserData().player1_score;
                ball.GetUserData().pause = true;
                //ball init
            }
            else if (newManifold.localPoint.x === -GameEnv_js_1.MAP_WIDTH && newManifold.localPoint.y === -GameEnv_js_1.MAP_HEIGHT) {
                ++ball.GetUserData().player2_score;
                ball.GetUserData().pause = true;
                //ball init
            }
        };
        //충돌후 콜 되는 이벤트, 공 속도보정
        world.GetContactManager().m_contactListener.PostSolve = function (contact, impulse) {
            const Ashape = contact.GetFixtureA();
            const Bshape = contact.GetFixtureB();
            const ball = Ashape.GetUserData() === "ball" ? Ashape.GetBody() : Bshape.GetBody();
            BallSpeedCorrection(ball, 6000);
            //console.log('call contactListener postsolve');
        };
    }
    function MovePeddle(user) {
        if (user.directionButton === GameEnum_js_1.PaddleState.STOP) {
            return;
        }
        const pos = user.paddle.GetPosition();
        let dir = user.directionButton;
        if (user.directionReverse) {
            dir = user.directionButton === GameEnum_js_1.PaddleState.UP ? GameEnum_js_1.PaddleState.DOWN : GameEnum_js_1.PaddleState.UP;
        }
        if (dir === GameEnum_js_1.PaddleState.UP && pos.y <= 23) {
            user.paddle.SetPositionXY(pos.x, pos.y + 1);
        }
        else if (dir === GameEnum_js_1.PaddleState.DOWN && pos.y >= -23) {
            user.paddle.SetPositionXY(pos.x, pos.y - 1);
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
            function (GameEnv_js_1_1) {
                GameEnv_js_1 = GameEnv_js_1_1;
            },
            function (GameEnum_js_1_1) {
                GameEnum_js_1 = GameEnum_js_1_1;
            },
            function (GameUser_js_1_1) {
                GameUser_js_1 = GameUser_js_1_1;
            },
            function (ObjectFactory_js_1_1) {
                ObjectFactory_js_1 = ObjectFactory_js_1_1;
            }
        ],
        execute: function () {
            GameSimulator = class GameSimulator extends testbed.Test {
                constructor() {
                    super();
                    //public world : Box2D.World = new Box2D.World(new Box2D.Vec2());
                    this.objectFactory = new ObjectFactory_js_1.ObjectFactory();
                    //ball create & add to world
                    this.m_world.SetGravity(new Box2D.Vec2(0, 0)); //무중력
                    this.ball = this.objectFactory.createBall(this.m_world);
                    this.objectFactory.createGround(this.m_world);
                    this.user1 = new GameUser_js_1.GameUser(this.objectFactory.createPaddle(this.m_world, -43, 0, "player1"));
                    this.user2 = new GameUser_js_1.GameUser(this.objectFactory.createPaddle(this.m_world, 43, 0, "player2"));
                    this.objectFactory.createObstacle(this.m_world);
                    BallSpeedCorrection(this.ball, 2000);
                    ContactListenerInit(this.m_world);
                    //start : ball velocity init
                    this.ball.SetLinearVelocity(new Box2D.Vec2(50, 40));
                }
                Keyboard(key) {
                    switch (key) {
                        case 'w':
                            this.user1.directionButton = GameEnum_js_1.PaddleState.UP;
                            break;
                        case 's':
                            this.user1.directionButton = GameEnum_js_1.PaddleState.DOWN;
                            break;
                        case 'q':
                            this.user1.skill.ReverseEnemyPaddleDirection(this.user2);
                            break;
                        case 'u':
                            this.user2.directionButton = GameEnum_js_1.PaddleState.UP;
                            break;
                        case 'j':
                            this.user2.directionButton = GameEnum_js_1.PaddleState.DOWN;
                            break;
                        case 'y':
                            this.user2.skill.ReverseEnemyPaddleDirection(this.user1);
                            break;
                    }
                }
                KeyboardUp(key) {
                    switch (key) {
                        case 'w':
                            this.user1.directionButton = GameEnum_js_1.PaddleState.STOP;
                            break;
                        case 's':
                            this.user1.directionButton = GameEnum_js_1.PaddleState.STOP;
                            break;
                        case 'u':
                            this.user2.directionButton = GameEnum_js_1.PaddleState.STOP;
                            break;
                        case 'j':
                            this.user2.directionButton = GameEnum_js_1.PaddleState.STOP;
                            break;
                    }
                }
                Step(settings) {
                    super.Step(settings);
                    if (this.ball.GetUserData().pause) {
                        this.ball.SetPositionXY(0, 0);
                        this.ball.GetUserData().pause = false;
                        BallSpeedCorrection(this.ball, 2000);
                        //Todo : MatchScore 확인 하고 종료
                    }
                    MovePeddle(this.user1);
                    MovePeddle(this.user2);
                    testbed.g_debugDraw.DrawString(5, this.m_textLine, "Keys: (w) p1_up, (s) p1_down, (u) p2_up, (j) p2_down");
                    this.m_textLine += 400;
                    testbed.g_debugDraw.DrawString(800, this.m_textLine, `player1 score : ${this.ball.GetUserData().player1_score}  player2 score : ${this.ball.GetUserData().player2_score}`);
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