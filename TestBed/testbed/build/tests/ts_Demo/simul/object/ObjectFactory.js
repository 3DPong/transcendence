System.register(["@box2d", "./ObjectDef.js"], function (exports_1, context_1) {
    "use strict";
    var Box2D, ObjectDef_js_1, ObjectFactory;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Box2D_1) {
                Box2D = Box2D_1;
            },
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
                createPaddle(world, x, y, id) {
                    const paddleDef = new ObjectDef_js_1.PaddleDef(x, y, id);
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
                createObstacle(world) {
                    const pindef1 = new ObjectDef_js_1.PinDef(0, 10);
                    const pin1 = world.CreateBody(pindef1.objectBodyDef);
                    pin1.CreateFixture(pindef1.objectFixtureDef);
                    const rectangleDef1 = new ObjectDef_js_1.RectangleDef(0, 16);
                    const rect1 = world.CreateBody(rectangleDef1.objectBodyDef);
                    rect1.SetLinearVelocity(new Box2D.Vec2(100, 80));
                    rect1.CreateFixture(rectangleDef1.objectFixtureDef);
                    const jd1 = new Box2D.DistanceJointDef();
                    jd1.Initialize(pin1, rect1, pin1.GetPosition(), rect1.GetPosition());
                    jd1.collideConnected = true;
                    world.CreateJoint(jd1);
                    const pindef2 = new ObjectDef_js_1.PinDef(0, -10);
                    const pin2 = world.CreateBody(pindef2.objectBodyDef);
                    pin2.CreateFixture(pindef2.objectFixtureDef);
                    const rectangleDef2 = new ObjectDef_js_1.RectangleDef(0, -16);
                    const rect2 = world.CreateBody(rectangleDef2.objectBodyDef);
                    rect2.CreateFixture(rectangleDef2.objectFixtureDef);
                    rect2.SetLinearVelocity(new Box2D.Vec2(-100, -80));
                    const jd2 = new Box2D.DistanceJointDef();
                    jd2.Initialize(pin2, rect2, pin2.GetPosition(), rect2.GetPosition());
                    jd2.collideConnected = true;
                    world.CreateJoint(jd2);
                }
            };
            exports_1("ObjectFactory", ObjectFactory);
        }
    };
});
//# sourceMappingURL=ObjectFactory.js.map