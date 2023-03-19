// MIT License
System.register(["@box2d", "@testbed"], function (exports_1, context_1) {
    "use strict";
    var Box2D, testbed, ObjectDefBase, BallDef, GroundDef, PaddleDef, ItemDef, ObjectFactory, AddPair, testIndex;
    var __moduleName = context_1 && context_1.id;
    function ContactListenerInit(world) {
        //  world.GetContactManager().m_contactListener.BeginContact = ()=>{};
        //  world.GetContactManager().m_contactListener.EndContact = ()=>{};
        //  world.GetContactManager().m_contactListener.PreSolve = ()=>{};
        world.GetContactManager().m_contactListener.PostSolve = function (contact, impulse) {
            console.log('call contactListener postsolve');
        };
    }
    return {
        setters: [
            function (Box2D_1) {
                Box2D = Box2D_1;
            },
            function (testbed_1) {
                testbed = testbed_1;
            }
        ],
        execute: function () {
            ObjectDefBase = class ObjectDefBase {
                constructor() {
                    this.objectBodyDef = new Box2D.BodyDef();
                    this.objectFixtureDef = new Box2D.FixtureDef();
                }
            };
            exports_1("ObjectDefBase", ObjectDefBase);
            BallDef = class BallDef extends ObjectDefBase {
                constructor() {
                    super();
                    this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
                    this.objectFixtureDef.shape = new Box2D.CircleShape();
                    this.objectFixtureDef.density = 1000;
                    this.objectFixtureDef.friction = 0; // temp
                }
            };
            exports_1("BallDef", BallDef);
            GroundDef = class GroundDef extends ObjectDefBase {
                constructor() {
                    super();
                    const vs = [
                        new Box2D.Vec2(-25, 25),
                        new Box2D.Vec2(25, 25),
                        new Box2D.Vec2(25, -25),
                        new Box2D.Vec2(-25, -25),
                    ]; // game box 크기 나중에 조절 해야함
                    this.objectFixtureDef.shape = new Box2D.ChainShape().CreateLoop(vs); //맞나?
                    this.objectFixtureDef.friction = 0;
                }
            };
            exports_1("GroundDef", GroundDef);
            PaddleDef = class PaddleDef extends ObjectDefBase {
                constructor(x, y) {
                    super();
                    this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
                    this.objectBodyDef.position.Set(x, y);
                    this.objectFixtureDef.shape = new Box2D.PolygonShape().SetAsBox(3, 10); //temp 값 이라 수정 해야함
                    this.objectFixtureDef.density = 1000;
                    this.objectFixtureDef.friction = 0.3;
                    this.objectFixtureDef.restitution = 0.8;
                }
            };
            exports_1("PaddleDef", PaddleDef);
            ItemDef = class ItemDef extends ObjectDefBase {
                constructor() {
                    super();
                    this.objectFixtureDef.shape = new Box2D.CircleShape();
                    this.objectFixtureDef.density = 1000;
                    this.objectFixtureDef.friction = 0; // temp
                    this.objectFixtureDef.isSensor = true;
                }
            };
            exports_1("ItemDef", ItemDef);
            ObjectFactory = class ObjectFactory {
                constructor() { }
                ;
                createBall(world) {
                    const ballDef = new BallDef();
                    world.CreateBody(ballDef.objectBodyDef).CreateFixture(ballDef.objectFixtureDef);
                }
                createGround(world) {
                    const groundDef = new GroundDef();
                    world.CreateBody(groundDef.objectBodyDef).CreateFixture(groundDef.objectFixtureDef);
                }
                createPaddle(world, x, y) {
                    const paddleDef = new PaddleDef(x, y);
                    world.CreateBody(paddleDef.objectBodyDef).CreateFixture(paddleDef.objectFixtureDef);
                }
                createItem(world) {
                    const itemDef = new ItemDef();
                    world.CreateBody(itemDef.objectBodyDef).CreateFixture(itemDef.objectFixtureDef);
                }
            };
            exports_1("ObjectFactory", ObjectFactory);
            AddPair = class AddPair extends testbed.Test {
                constructor() {
                    super();
                    this.world = new Box2D.World(new Box2D.Vec2());
                    this.objectFactory = new ObjectFactory();
                    {
                        //ball create & add to world
                        this.objectFactory.createBall(this.world);
                        this.objectFactory.createGround(this.world);
                        this.objectFactory.createPaddle(this.world, -23, 0); //left
                        this.objectFactory.createPaddle(this.world, 23, 0); //right
                        ContactListenerInit(this.world);
                    }
                    this.m_world = this.world;
                }
                Keyboard(key) {
                    switch (key) {
                        default:
                            super.Keyboard(key);
                            break;
                    }
                }
                Step(settings) {
                    super.Step(settings);
                }
                static Create() {
                    return new AddPair();
                }
            };
            exports_1("AddPair", AddPair);
            exports_1("testIndex", testIndex = testbed.RegisterTest("Benchmark", "Add Pair", AddPair.Create));
        }
    };
});
//# sourceMappingURL=add_pair.js.map