System.register([], function (exports_1, context_1) {
    "use strict";
    var GameSkill;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            GameSkill = class GameSkill {
                constructor() {
                    this.paddleDirectionSkillCount = 1;
                }
                ReverseEnemyPaddleDirection(enemyUser) {
                    enemyUser.directionReverse = true;
                    --this.paddleDirectionSkillCount;
                    this.paddleDirectionSkillTimeOut = setTimeout(() => enemyUser.directionReverse = false, 5000);
                }
            };
            exports_1("GameSkill", GameSkill);
        }
    };
});
//# sourceMappingURL=GameSkill.js.map