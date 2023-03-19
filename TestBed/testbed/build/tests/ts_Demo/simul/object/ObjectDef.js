System.register(["@box2d"], function (exports_1, context_1) {
    "use strict";
    var Box2D, ObjectDefBase, BallDef, GroundDef, PaddleDef, ItemDef;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (Box2D_1) {
                Box2D = Box2D_1;
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
                    this.objectFixtureDef.shape = new Box2D.CircleShape().Set(new Box2D.Vec2(0, 0), 2);
                    this.objectFixtureDef.density = 1000;
                    this.objectFixtureDef.friction = 0.2; // temp
                    this.objectFixtureDef.restitution = 1;
                }
            };
            exports_1("BallDef", BallDef);
            GroundDef = class GroundDef extends ObjectDefBase {
                constructor() {
                    super();
                    const vs = [
                        new Box2D.Vec2(-50, 25),
                        new Box2D.Vec2(50, 25),
                        new Box2D.Vec2(50, -25),
                        new Box2D.Vec2(-50, -25),
                    ]; // game box 크기 나중에 조절 해야함
                    this.objectFixtureDef.shape = new Box2D.ChainShape().CreateLoop(vs); //맞나?
                    this.objectFixtureDef.friction = 0;
                }
            };
            exports_1("GroundDef", GroundDef);
            PaddleDef = class PaddleDef extends ObjectDefBase {
                constructor(x, y) {
                    super();
                    //this.objectBodyDef.type = Box2D.BodyType.b2_dynamicBody;
                    this.objectBodyDef.position.Set(x, y);
                    this.objectFixtureDef.shape = new Box2D.PolygonShape().SetAsBox(1, 5); //temp 값 이라 수정 해야함
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
        }
    };
});
//# sourceMappingURL=ObjectDef.js.map