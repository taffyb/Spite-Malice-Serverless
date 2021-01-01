"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
class Utils {
    static calculateOverallScore(finalMove) {
        let move = finalMove;
        let score = move.score;
        let i = 0;
        while (move.previousMove) {
            score += finalMove.previousMove.score;
            move = move.previousMove;
            i++;
        }
        return score;
    }
    static allPossibleMoves(moves) {
        let possibleMoves = [];
        if (moves) {
            moves.forEach((m) => {
                // console.log(`moves:${moves.length} next:${m.nextMoves?m.nextMoves.length:0}`);
                if (m.nextMoves.length > 0) {
                    possibleMoves = possibleMoves.concat(Utils.allPossibleMoves(m.nextMoves));
                    // console.log(`Next Moves - possibleMoves:${possibleMoves.length}`);
                }
                else {
                    possibleMoves.push(m);
                    // console.log(`possibleMoves:${possibleMoves.length}`);
                }
            });
        }
        return possibleMoves;
    }
    static turn(move) {
        let m = move;
        let turn = [];
        // console.log(`Move=>Turn ${m}`);
        //build an array of moves
        turn.push(m);
        while (m.previousMove) {
            turn.push(m.previousMove);
            m = m.previousMove;
        }
        turn = turn.reverse();
        return turn;
    }
    static freePlayerStacks(cards, playerIdx) {
        let freePlayerStacks = 0;
        for (let i = 0; i < 4; i++) {
            if (cards[s_n_m_lib_1.PositionsEnum.PLAYER_STACK_1 + i + (10 * playerIdx)].length == 0) {
                freePlayerStacks += 1;
            }
        }
        return freePlayerStacks;
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
    static intArr2CardArr(inArr) {
        const cards = [];
        for (let pos = s_n_m_lib_1.PositionsEnum.PLAYER_PILE; pos <= s_n_m_lib_1.PositionsEnum.RECYCLE; pos++) {
            cards.push([]);
            for (let c = 0; c < inArr[pos].length; c++) {
                cards[pos].push(new s_n_m_lib_1.Card(inArr[pos][c], pos));
            }
        }
        return cards;
    }
    static cardArr2IntArr(inArr) {
        const cards = [];
        for (let pos = s_n_m_lib_1.PositionsEnum.PLAYER_PILE; pos <= s_n_m_lib_1.PositionsEnum.RECYCLE; pos++) {
            cards.push([]);
            for (let c = 0; c < inArr[pos].length; c++) {
                cards[pos].push(inArr[pos][c].cardNo);
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
        let topMoveIdx = 1;
        if (moves.length == 0) {
            throw "NO MOVES";
        }
        else if (moves.length > 1) {
            //sort moves by score
            moves.sort((a, b) => { return b.score - a.score; });
            let topScore = moves[0].score;
            //collect all moves with the highest score
            for (let i = 0; i < moves.length; i++) {
                let m = moves[i];
                if (m.score == topScore) {
                    topMoves.push(m);
                }
                else {
                    break;
                }
            }
            // random pick of the top moves
            if (topMoves.length > 1) {
                topMoveIdx = Math.floor(Math.random() * (topMoves.length)) + 1;
            }
        }
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