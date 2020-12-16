"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lambdaHandler = void 0;
const s_n_m_lib_1 = require("s-n-m-lib");
exports.lambdaHandler = async (event) => {
    const game = s_n_m_lib_1.GameFactory.gameFromInterface(event.game);
    return {
        statusCode: 200,
        body: `Queries: `
    };
};
//# sourceMappingURL=index.js.map