System.register(["./ObjectDef.js"], function (exports_1, context_1) {
    "use strict";
    var ObjectDef_js_1, ObjectFactory;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (ObjectDef_js_1_1) {
                ObjectDef_js_1 = ObjectDef_js_1_1;
            }
        ],
        execute: function () {
            ObjectFactory = class ObjectFactory {
                createBall(world) {
                    const ballDef = new ObjectDef_js_1.BallDef();
                    const ball = world.CreateBody(ballDef.objectBodyDef);
                    ball.CreateFixture(ballDef.objectFixtureDef);
                    return ball;
                }
                createGround(world) {
                    const groundDef = new ObjectDef_js_1.GroundDef();
                    world.CreateBody(groundDef.objectBodyDef).CreateFixture(groundDef.objectFixtureDef);
                }
                createPaddle(world, x, y) {
                    const paddleDef = new ObjectDef_js_1.PaddleDef(x, y);
                    const paddle = world.CreateBody(paddleDef.objectBodyDef);
                    paddle.CreateFixture(paddleDef.objectFixtureDef);
                    return paddle;
                }
                createItem(world) {
                    const itemDef = new ObjectDef_js_1.ItemDef();
                    const item = world.CreateBody(itemDef.objectBodyDef);
                    item.CreateFixture(itemDef.objectFixtureDef);
                    return item;
                }
            };
            exports_1("ObjectFactory", ObjectFactory);
        }
    };
});
//# sourceMappingURL=ObjectFactory.js.map