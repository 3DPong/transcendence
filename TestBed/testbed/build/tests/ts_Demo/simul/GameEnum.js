System.register([], function (exports_1, context_1) {
    "use strict";
    var PaddleState;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            (function (PaddleState) {
                PaddleState[PaddleState["UP"] = 0] = "UP";
                PaddleState[PaddleState["DOWN"] = 1] = "DOWN";
                PaddleState[PaddleState["STOP"] = 2] = "STOP";
            })(PaddleState || (PaddleState = {}));
            exports_1("PaddleState", PaddleState);
        }
    };
});
//# sourceMappingURL=GameEnum.js.map