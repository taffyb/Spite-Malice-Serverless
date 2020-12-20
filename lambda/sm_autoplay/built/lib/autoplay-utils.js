"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
class Utils {
    static calculateOverallScore(finalMove) {
        let move = finalMove;
        let score = move.score;
        while (move.previousMove) {
            score += finalMove.previousMove.score;
            move = move.previousMove;
        }
        return score;
    }
    static applyMove(cards, move) {
        cards[move.from].pop();
        cards[move.to].push(new s_n_m_lib_1.Card(move.card, move.to));
        return cards;
    }
    static cardsInHand(cards, playerIdx) {
        let cardsInHand = 5;
        for (let h = 0; h < 5; h++) {
            if (cards[s_n_m_lib_1.PositionsEnum.PLAYER_HAND_1 + (playerIdx * 10) + h].length == 0) {
                cardsInHand -= 1;
            }
        }
        return cardsInHand;
    }
    static cardsFromArray(inArr) {
        const cards = [];
        for (let pos = s_n_m_lib_1.PositionsEnum.PLAYER_PILE; pos <= s_n_m_lib_1.PositionsEnum.RECYCLE; pos++) {
            cards.push([]);
            for (let c = 0; c < inArr[pos].length; c++) {
                cards[pos].push(new s_n_m_lib_1.Card(inArr[pos][c], pos));
            }
        }
        return cards;
    }
    static getSequence(cards, p, playerIdx = 0) {
        let sequenceLength = 1;
        let sequenceValue = 0;
        if (cards[p].length > 1) {
            const start = s_n_m_lib_1.SMUtils.toFaceNumber(cards[p][cards[p].length - 1].cardNo);
            const topOfPile = s_n_m_lib_1.SMUtils.getTopCard(cards[s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx)]);
            let c = start;
            for (let i = cards[p].length - 2; i >= 0; i--) {
                let nextCard = s_n_m_lib_1.SMUtils.toFaceNumber(cards[p][i].cardNo);
                if (nextCard > c) {
                    sequenceLength++;
                    c = nextCard;
                }
                else {
                    break;
                }
            }
            sequenceValue = ((s_n_m_lib_1.SMUtils.toFaceNumber(cards[p][cards[p].length - (sequenceLength)].cardNo) - start) / (sequenceLength - 1));
        }
        // console.log(`{${sequenceLength},${sequenceValue}}`);
        return { length: sequenceLength, value: sequenceValue };
    }
    static getTopMove(moves) {
        let topMoves = [];
        //sort moves by score
        moves.sort((a, b) => { return b.score - a.score; });
        let topScore = moves[0].score;
        //collect all moves with the highest score
        // console.log(`TopScore:${topScore}`)
        for (let i = 0; i < moves.length; i++) {
            let m = moves[i];
            if (m.score == topScore) {
                topMoves.push(m);
            }
            else {
                break;
            }
        }
        // console.log(`topMoves.length:${topMoves.length}`)
        // randomly pick of the top moves
        let topMoveIdx = Math.floor(Math.random() * (topMoves.length)) + 1;
        return topMoves[topMoveIdx - 1];
    }
    static cardsToString(cards) {
        let out = "";
        cards.forEach((pos, posIdx) => {
            out += "[";
            pos.forEach((c, cIdx) => {
                out += c.cardNo;
                if (cIdx != pos.length - 1) {
                    out += ",";
                }
            });
            out += "]";
            if (posIdx != cards.length - 1) {
                out += ",";
            }
            out += "\n";
        });
        return out;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=autoplay-utils.js.map