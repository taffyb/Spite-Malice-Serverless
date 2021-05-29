"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const player_1 = require("./lib/player");
exports.lambdaHandler = async (event, context, callback) => {
    const game = s_n_m_lib_1.GameFactory.gameFromInterface(event.game);
    let moves = [];
    const playerIdx = 0;
    const player = new player_1.PlayerV2("uuid", playerIdx);
    moves = player.nextTurn(game.cards);
    callback(moves);
};
//# sourceMappingURL=index.js.map