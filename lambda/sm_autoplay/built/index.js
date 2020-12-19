"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const find_moves_1 = require("./lib/find-moves");
exports.lambdaHandler = async (event, context, callback) => {
    const game = s_n_m_lib_1.GameFactory.gameFromInterface(event.game);
    const moves = [];
    moves.push(...find_moves_1.RoboPlayer.findMoves(game.activePlayer, game.cards));
    callback(moves);
};
//# sourceMappingURL=index.js.map