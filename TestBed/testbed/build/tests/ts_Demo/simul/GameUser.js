System.register(["./GameEnum.js", "./GameSkill.js"], function (exports_1, context_1) {
    "use strict";
    var GameEnum_js_1, GameSkill_js_1, GameUser;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (GameEnum_js_1_1) {
                GameEnum_js_1 = GameEnum_js_1_1;
            },
            function (GameSkill_js_1_1) {
                GameSkill_js_1 = GameSkill_js_1_1;
            }
        ],
        execute: function () {
            GameUser = class GameUser {
                constructor(paddle) {
                    this.directionButton = GameEnum_js_1.PaddleState.STOP;
                    this.directionReverse = false;
                    this.paddle = paddle;
                    this.skill = new GameSkill_js_1.GameSkill();
                }
            };
            exports_1("GameUser", GameUser);
        }
    };
});
//# sourceMappingURL=GameUser.js.map