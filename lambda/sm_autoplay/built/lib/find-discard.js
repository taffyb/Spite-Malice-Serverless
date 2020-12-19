"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const auto_move_1 = require("./auto-move");
const autoplay_utils_1 = require("./autoplay-utils");
const move_enum_1 = require("./move-enum");
class DiscardMoves {
    static findDiscardMoves(playerIdx, cards) {
        let moves = [];
        let m;
        //find all discard options
        for (let ph = (10 * playerIdx) + s_n_m_lib_1.PositionsEnum.PLAYER_HAND_1; ph <= (10 * playerIdx) + s_n_m_lib_1.PositionsEnum.PLAYER_HAND_5; ph++) {
            if (s_n_m_lib_1.SMUtils.getTopCard(cards[ph]) != s_n_m_lib_1.CardsEnum.NO_CARD) {
                for (let ps = (10 * playerIdx) + s_n_m_lib_1.PositionsEnum.PLAYER_STACK_1; ps <= (10 * playerIdx) + s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4; ps++) {
                    m = new auto_move_1.AutoMove();
                    m.from = ph;
                    m.card = s_n_m_lib_1.SMUtils.getTopCard(cards[ph]);
                    m.to = ps;
                    m.score = 0;
                    m.isDiscard = true;
                    moves.push(m);
                }
            }
        }
        //score each move
        moves.forEach((m) => {
            let score = 0;
            //does it continue a sequence?
            let diffFromTo = s_n_m_lib_1.SMUtils.diff(cards, m.from, m.to);
            let diffFromPile = s_n_m_lib_1.SMUtils.diff(cards, m.from, s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx));
            let sequence = autoplay_utils_1.Utils.getSequence(cards, m.to, playerIdx);
            // console.log(`diffFromTo: ${diffFromTo}`);
            if (diffFromTo == 0) {
                score += (move_enum_1.MoveScoresEnum.DISCARD_IN_SEQUENCE);
                if (sequence.length > 1) {
                    score += (move_enum_1.MoveScoresEnum.DISCARD_BLOCK_SEQUENCE + sequence.value);
                }
            }
            else if (diffFromTo < 0) {
                score += (move_enum_1.MoveScoresEnum.DISCARD_IN_SEQUENCE + (diffFromTo + 1));
                if (diffFromPile == 0) {
                    score += (move_enum_1.MoveScoresEnum.DISCARD_BLOCK_SELF);
                }
            }
            else {
                score += (move_enum_1.MoveScoresEnum.DISCARD_BLOCK_SEQUENCE + sequence.value);
            }
            m.score = score;
        });
        return moves;
    }
}
exports.DiscardMoves = DiscardMoves;
//# sourceMappingURL=find-discard.js.map