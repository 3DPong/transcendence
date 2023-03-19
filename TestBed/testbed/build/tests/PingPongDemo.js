// MIT License
System.register(["@box2d", "@testbed", "./ts_Demo/simul/object/ObjectFactory.js"], function (exports_1, context_1) {
    "use strict";
    var Box2D, testbed, ObjectFactory_js_1, AddPair, testIndex;
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
            },
            function (ObjectFactory_js_1_1) {
                ObjectFactory_js_1 = ObjectFactory_js_1_1;
            }
        ],
        execute: function () {
            AddPair = class AddPair extends testbed.Test {
                constructor() {
                    super();
                    //public world : Box2D.World = new Box2D.World(new Box2D.Vec2());
                    this.objectFactory = new ObjectFactory_js_1.ObjectFactory();
                    //ball create & add to world
                    this.m_world.SetGravity(new Box2D.Vec2(0, 0)); //무중력
                    this.objectFactory.createBall(this.m_world);
                    this.objectFactory.createGround(this.m_world);
                    this.objectFactory.createPaddle(this.m_world, -23, 0); //left
                    this.objectFactory.createPaddle(this.m_world, 23, 0); //right
                    ContactListenerInit(this.m_world);
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
            exports_1("testIndex", testIndex = testbed.RegisterTest("PingPong:", "pingPongTest", AddPair.Create));
        }
    };
});
//# sourceMappingURL=PingPongDemo.js.map