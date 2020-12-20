"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const autoplay_utils_1 = require("../lib/autoplay-utils");
const find_moves_1 = require("../lib/find-moves");
const find_moves_refill_hand_1 = require("../tests/find-moves-refill_hand");
class TestFindMoves {
    static execute() {
        let cards = autoplay_utils_1.Utils.cardsFromArray(find_moves_refill_hand_1.cards);
        const moves = find_moves_1.RoboPlayer.findMoves(0, cards);
        // console.log(`{cards:${JSON.stringify(cards)}`);
        moves.sort((a, b) => { return a.from - b.from; });
        moves.forEach((m) => {
            console.log(`{from:${s_n_m_lib_1.PositionsEnum[m.from]},card:${s_n_m_lib_1.CardsEnum[m.card]},to:${s_n_m_lib_1.PositionsEnum[m.to]},score:${m.score}}`);
        });
        let topMove = null;
        if (moves.length > 1) {
            topMove = autoplay_utils_1.Utils.getTopMove(moves);
        }
        else if (moves.length == 1) {
            topMove = moves[0];
        }
        if (topMove != null) {
            console.log(`TopMove {from:${s_n_m_lib_1.PositionsEnum[topMove.from]},card:${s_n_m_lib_1.CardsEnum[topMove.card]},to:${s_n_m_lib_1.PositionsEnum[topMove.to]}}`);
        }
        return true;
    }
}
exports.TestFindMoves = TestFindMoves;
TestFindMoves.execute();
//# sourceMappingURL=TestFindMoves.js.map