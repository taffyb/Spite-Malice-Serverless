"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const autoplay_utils_1 = require("../lib/autoplay-utils");
const find_moves_1 = require("../lib/find-moves");
const find_moves_sequence_to_game_stack_1 = require("../tests/find-moves-sequence-to-game-stack");
class TestFindMoves {
    static execute() {
        const playerIdx = 0;
        let cards = autoplay_utils_1.Utils.intArr2CardArr(find_moves_sequence_to_game_stack_1.cards);
        const moves = find_moves_1.RoboPlayer.findMoves(playerIdx, cards);
        // console.log(`moves:${moves.length} \n${moves}`);
        if (moves) {
            moves.forEach((m) => {
                m.score = autoplay_utils_1.Utils.calculateOverallScore(m);
            });
        }
        moves.sort((a, b) => { return a.score - b.score; });
        let topMove;
        let turn = [];
        if (moves.length > 0) {
            topMove = autoplay_utils_1.Utils.getTopMove(moves);
            turn = autoplay_utils_1.Utils.turn(topMove);
        }
        if (turn.length > 0) {
            turn.forEach((m, i) => {
                console.log(`${"\t".repeat(i)}[${s_n_m_lib_1.CardsEnum[m.card]}] ${m.from}=>${m.to}`);
            });
        }
        return true;
    }
}
exports.TestFindMoves = TestFindMoves;
TestFindMoves.execute();
//# sourceMappingURL=TestFindMoves.js.map