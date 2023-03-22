System.register(["@box2d", "../../gameEnv/GameEnv.js", "./InGameObjectData.js"], function (exports_1, context_1) {
    "use strict";
    var Box2D, GameEnv_js_1, InGameObjectData_js_1, ObjectType, ObjectDefBase, BallDef, GroundDef, PaddleDef, ItemDef, PinDef, RectangleDef;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Box2D_1) {
                Box2D = Box2D_1;
            },
            function (GameEnv_js_1_1) {
                GameEnv_js_1 = GameEnv_js_1_1;
            },
            function (InGameObjectData_js_1_1) {
                InGameObjectData_js_1 = InGameObjectData_js_1_1;
            }
        ],
        execute: function () {
            (function (ObjectType) {
                ObjectType[ObjectType["BALL"] = 0] = "BALL";
                ObjectType[ObjectType["PADDLE"] = 1] = "PADDLE";
                //etc..
            })(ObjectType || (ObjectType = {}));
            exports_1("ObjectType", ObjectType);
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
                    this.objectBodyDef.userData = new InGameObjectData_js_1.InGameData("ball", ObjectType.BALL);
                    this.objectFixtureDef.shape = new Box2D.CircleShape().Set(new Box2D.Vec2(0, 0), 1);
                    this.objectFixtureDef.density = 1000;
                    this.objectFixtureDef.friction = 0; // temp
                    this.objectFixtureDef.restitution = 1;
                }
            };
            exports_1("BallDef", BallDef);
            GroundDef = class GroundDef extends ObjectDefBase {
                constructor() {
                    super();
                    const vs = [
                        new Box2D.Vec2(-GameEnv_js_1.MAP_WIDTH, GameEnv_js_1.MAP_HEIGHT),
                        new Box2D.Vec2(GameEnv_js_1.MAP_WIDTH, GameEnv_js_1.MAP_HEIGHT),
                        new Box2D.Vec2(GameEnv_js_1.MAP_WIDTH, -GameEnv_js_1.MAP_HEIGHT),
                        new Box2D.Vec2(-GameEnv_js_1.MAP_WIDTH, -GameEnv_js_1.MAP_HEIGHT),
                    ]; // game box 크기 나중에 조절 해야함
                    this.objectFixtureDef.shape = new Box2D.ChainShape().CreateLoop(vs); //맞나?
                    this.objectFixtureDef.friction = 0.3;
                }
            };
            exports_1("GroundDef", GroundDef);
            PaddleDef = class PaddleDef extends ObjectDefBase {
                constructor(x, y, id) {
                    super();
                    //this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
                    this.objectBodyDef.position.Set(x, y);
                    this.objectBodyDef.userData = new InGameObjectData_js_1.InGameData(id, ObjectType.PADDLE);
                    this.objectFixtureDef.shape = new Box2D.PolygonShape().SetAsBox(1, 5); //temp 값 이라 수정 해야함
                    this.objectFixtureDef.density = 1000;
                    this.objectFixtureDef.friction = 0;
                    this.objectFixtureDef.restitution = 1;
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
            PinDef = class PinDef extends ObjectDefBase {
                constructor(posX, posY) {
                    super();
                    this.objectBodyDef.position.Set(posX, posY); //temp
                    this.objectFixtureDef.shape = new Box2D.CircleShape();
                    this.objectFixtureDef.density = 1000;
                    this.objectFixtureDef.friction = 0; // temp
                    this.objectFixtureDef.isSensor = true;
                }
            };
            exports_1("PinDef", PinDef);
            RectangleDef = class RectangleDef extends ObjectDefBase {
                constructor(posX, posY) {
                    super();
                    this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
                    this.objectBodyDef.position.Set(posX, posY); //temp
                    this.objectFixtureDef.shape = new Box2D.PolygonShape().SetAsBox(2, 1);
                    this.objectFixtureDef.friction = 0;
                    this.objectFixtureDef.restitution = 1;
                    this.objectFixtureDef.density = 1000;
                    this.objectFixtureDef.userData = "rectangle";
                }
            };
            exports_1("RectangleDef", RectangleDef);
        }
    };
});
//# sourceMappingURL=ObjectDef.js.map