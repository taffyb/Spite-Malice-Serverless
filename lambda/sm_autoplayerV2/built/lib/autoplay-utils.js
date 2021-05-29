"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const s_n_m_lib_1 = require("s-n-m-lib");
class Utils {
    static cardOnStack(cards, arg1) {
        for (let gp = s_n_m_lib_1.PositionsEnum.STACK_1; gp <= s_n_m_lib_1.PositionsEnum.STACK_4; gp++) {
            if (s_n_m_lib_1.SMUtils.toFaceNumber(s_n_m_lib_1.SMUtils.getFaceNumberN(cards[gp]))) {
                return true;
            }
        }
        return false;
    }
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
        let autoMove = move;
        let m;
        let turn = [];
        //       console.log(`Move=>Turn ${autoMove}`);
        //build an array of moves
        m = new s_n_m_lib_1.Move();
        m.from = autoMove.from;
        m.to = autoMove.to;
        m.card = autoMove.card;
        m.isDiscard = autoMove.isDiscard;
        turn.push(m);
        while (autoMove.previousMove) {
            m = new s_n_m_lib_1.Move();
            m.from = autoMove.previousMove.from;
            m.to = autoMove.previousMove.to;
            m.card = autoMove.previousMove.card;
            m.isDiscard = autoMove.previousMove.isDiscard;
            turn.push(m);
            autoMove = autoMove.previousMove;
        }
        turn = turn.reverse();
        //       console.log(`Move=>Turn ${JSON.stringify(turn,null, 2)}`);
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
        let c = cards[move.from].pop();
        cards[move.to].push(c);
        return cards;
    }
    static applyMoveN(cards, move) {
        let c = cards[move.from].pop();
        cards[move.to].push(c);
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
    static cardsInHandN(cards, playerIdx) {
        let cardsInHand = 5;
        for (let h = 0; h < 5; h++) {
            if (cards[s_n_m_lib_1.PositionsEnum.PLAYER_HAND_1 + (playerIdx * 10) + h].length == 0) {
                cardsInHand -= 1;
            }
        }
        return cardsInHand;
    }
    // static intArr2CardArr(inArr:number[][]):ICardModel[][]{
    //     const cards:ICardModel[][]=[];
    //     for(let pos:number=PositionsEnum.PLAYER_PILE;pos<=PositionsEnum.RECYCLE;pos++){
    //         cards.push([]);
    //         for(let c:number=0;c<inArr[pos].length;c++){
    //             cards[pos].push(new Card(inArr[pos][c],pos));
    //         }
    //     }
    //     return cards;
    // }
    /**
     * getSequence
     *
     * @param cards - array of cards
     * @returns {length:number,value:number}
     * length is the number of cards in a ascending order eg. [13,12,10] = 4
     * value is an indication of how sparce the sequence is [13,12,11,10] =1 ; [13,12,10]=.75 (3/4)
    */
    static getSequence(cards) {
        let sequenceLength = 1;
        let sequenceValue = 0;
        if (cards.length > 1) {
            const end = s_n_m_lib_1.SMUtils.toFaceNumber(cards[cards.length - 1].cardNo);
            let lastCard = end;
            for (let i = cards.length - 2; i >= 0; i--) {
                let nextCard = s_n_m_lib_1.SMUtils.toFaceNumber(cards[i].cardNo);
                if (nextCard > lastCard) {
                    sequenceLength++;
                    lastCard = nextCard;
                }
                else {
                    break;
                }
            }
            sequenceValue = ((sequenceLength) / (lastCard - end + 1));
        }
        // console.log(`{${sequenceLength},${sequenceValue}}`);
        return { length: sequenceLength, value: (Number.isNaN(sequenceValue) ? 0 : sequenceValue) };
    }
    /**
     * getSequenceN
     *
     * @param cards - array of cards
     * @returns {length:number,value:number}
     * length is the number of cards in a ascending order eg. [13,12,10] = 4
     * value is an indication of how sparce the sequence is [13,12,11,10] =1 ; [13,12,10]=.75 (3/4)
    */
    static getSequenceN(cards) {
        let sequenceLength = 1;
        let sequenceValue = 0;
        if (cards.length > 1) {
            const end = s_n_m_lib_1.SMUtils.toFaceNumber(cards[cards.length - 1]);
            let lastCard = end;
            for (let i = cards.length - 2; i >= 0; i--) {
                let nextCard = s_n_m_lib_1.SMUtils.toFaceNumber(cards[i]);
                if (nextCard > lastCard) {
                    sequenceLength++;
                    lastCard = nextCard;
                }
                else {
                    break;
                }
            }
            sequenceValue = ((sequenceLength) / (lastCard - end + 1));
        }
        // console.log(`{${sequenceLength},${sequenceValue}}`);
        return { length: sequenceLength, value: (Number.isNaN(sequenceValue) ? 0 : sequenceValue) };
    }
    static getTopMove(moves) {
        let topMoves = [];
        let topMoveIdx = 1;
        if (moves.length == 0) {
            console.trace;
            throw new Error("NO MOVES");
        }
        else if (moves.length > 1) {
            //sort moves by score (DEC)
            moves.sort((a, b) => { return b.score - a.score; });
            let topScore = moves[0].score;
            //collect all moves with the highest score
            //           moves.forEach((m,i)=>{console.log(`Move[${i}] ${Utils.moveToString(m)} ${m.isDiscard?'DISCARD':''}`);});
            for (let i = 0; i < moves.length; i++) {
                let m = moves[i];
                if (m.score == topScore) {
                    //                   console.log(`Possible TopMove\n${m}`);
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
    static closestStackToPile(cards, playerIdx) {
        let shortestDistanceToPile = 13;
        let closestStackToPile = s_n_m_lib_1.PositionsEnum.STACK_1;
        let playerPile = cards[s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx)];
        let pileCard = s_n_m_lib_1.SMUtils.toFaceNumber(playerPile[playerPile.length - 1]);
        for (let s = s_n_m_lib_1.PositionsEnum.STACK_1; s <= s_n_m_lib_1.PositionsEnum.STACK_4; s++) {
            let distance = 0;
            if (cards[s].length == 0) {
                let stackCard = s_n_m_lib_1.SMUtils.getFaceNumberN(cards[s]);
                if (pileCard > stackCard) {
                    distance = pileCard - stackCard;
                }
                else {
                    distance = 13 - stackCard + pileCard;
                }
            }
            else {
                distance = pileCard;
            }
            if (distance < shortestDistanceToPile) {
                shortestDistanceToPile = distance;
                closestStackToPile = s;
            }
        }
        return closestStackToPile;
    }
    static moveToString(move) {
        let out = "";
        const m = move;
        out += `<${s_n_m_lib_1.SMUtils.toFaceNumber(m.card)}> ${m.from}=>${m.to} (${m.score})`;
        return out;
    }
    static cardsToString(cards) {
        let out = "";
        cards.forEach((pos, posIdx) => {
            out += `[`;
            pos.forEach((c, cIdx) => {
                out += s_n_m_lib_1.SMUtils.toFaceNumber(c.cardNo);
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
    static cardsNToString(cards) {
        let out = "";
        cards.forEach((pos, posIdx) => {
            out += `[`;
            pos.forEach((c, cIdx) => {
                out += s_n_m_lib_1.SMUtils.toFaceNumber(c);
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
    static recycleCards(game, position) {
        const moves = [];
        for (let i = game.cards[position].length - 1; i >= 0; i--) {
            let c = game.cards[position][i];
            let m = new s_n_m_lib_1.Move();
            m.card = c.cardNo;
            m.from = position;
            m.to = s_n_m_lib_1.PositionsEnum.RECYCLE;
            m.type = s_n_m_lib_1.MoveTypesEnum.RECYCLE;
            moves.push(m);
        }
        return moves;
    }
    static cardsInPlay(cards) {
        let cardsInPlay = 0;
        cards.forEach((m) => {
            cardsInPlay += m.length;
        });
        return cardsInPlay;
    }
    static log(filename, s) {
        const file = fs_1.appendFileSync(`./output/${filename}.txt`, s + '\n');
    }
    static addCard(cards, m) {
        let c = new s_n_m_lib_1.Card(m.card, m.to);
        cards[m.to].push(c);
    }
    static cardsFromFile(filename) {
        let cards = [];
        let cardsTemp = [];
        let file = fs_1.readFileSync(filename).toString();
        cardsTemp = JSON.parse(file);
        cardsTemp.forEach((pos, i) => {
            cards.push([]);
            pos.forEach((c) => {
                cards[i].push(new s_n_m_lib_1.Card(c, i));
            });
        });
        return cards;
    }
    static movesFromFile(filename) {
        let moves = [];
        let file = fs_1.readFileSync(filename).toString();
        moves = JSON.parse(file);
        return moves;
    }
    static undoMove(m, cards) {
        let card = cards[m.to].pop();
        cards[m.from].push(card);
    }
    /**
     * @description Converts an ICardModel structure a simple Number array structure
     * @param cards ICardModel[][]
     * @returns number[][]
     */
    static cards2cardsN(cards) {
        const cardsN = [];
        cards.forEach((pos, i) => {
            cardsN.push([]);
            pos.forEach((c) => {
                cardsN[i].push(c.cardNo);
            });
        });
        return cardsN;
    }
    static flattenHand(cards, playerIdx) {
        let flattenHand = [];
        for (let i = s_n_m_lib_1.PositionsEnum.PLAYER_HAND_1 + (playerIdx * 10); i <= s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4 + (playerIdx * 10); i++) {
            cards[i].forEach((c) => {
                flattenHand.push(s_n_m_lib_1.SMUtils.toFaceNumber(c));
            });
        }
        return flattenHand;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=autoplay-utils.js.map