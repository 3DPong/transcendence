System.register([], function (exports_1, context_1) {
    "use strict";
    var InGameData;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            InGameData = class InGameData {
                constructor(id, type) {
                    this.id = id;
                    this.pause = false;
                    this.type = type;
                    this.player1_score = 0;
                    this.player2_score = 0;
                }
            };
            exports_1("InGameData", InGameData);
        }
    };
});
//# sourceMappingURL=InGameObjectData.js.map