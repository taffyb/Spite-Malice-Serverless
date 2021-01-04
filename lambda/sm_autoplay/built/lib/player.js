"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const move_enum_1 = require("./move-enum");
const auto_move_1 = require("./auto-move");
const autoplay_utils_1 = require("./autoplay-utils");
class Player {
    constructor(uuid, idx) {
        this.idx = idx;
        this.uuid = uuid;
    }
    nextTurn(cards) {
        let possibleMoves = [];
        this.findNextMoves(this.idx, cards, possibleMoves);
        console.log(`POSSIBLE MOVES ${possibleMoves.length}`);
        if (possibleMoves) {
            possibleMoves.forEach((m, i) => {
                if (m) {
                    m.score = autoplay_utils_1.Utils.calculateOverallScore(m);
                }
                else {
                    possibleMoves.splice(i, 1);
                }
            });
        }
        possibleMoves.sort((a, b) => { return a.score - b.score; });
        let topMove;
        let turn = [];
        if (possibleMoves.length > 1) {
            console.log(`Player.nextTurn multiple possible moves (${possibleMoves.length})`);
            topMove = autoplay_utils_1.Utils.getTopMove(possibleMoves);
            turn = autoplay_utils_1.Utils.turn(topMove);
        }
        else if (possibleMoves.length == 1) {
            turn = autoplay_utils_1.Utils.turn(possibleMoves[0]);
        }
        else {
            throw "NO POSSIBLE MOVE";
        }
        // console.log(`TURN length: ${turn.length}`);
        return turn;
    }
    findNextMoves(playerIdx, cards, possibleMoves, depth = 0) {
        //    console.log(`Player.findNextMoves(depth=${depth})`);
        // depth+=1;
        let m;
        let moves = [];
        let allMoves = [];
        let bail = false;
        for (let pp = s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx); pp <= s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4 + (10 * playerIdx); pp++) {
            if (bail) {
                break;
            }
            switch (pp) {
                case s_n_m_lib_1.PositionsEnum.PLAYER_PILE:
                    for (let gp = s_n_m_lib_1.PositionsEnum.STACK_1; gp <= s_n_m_lib_1.PositionsEnum.STACK_4; gp++) {
                        //If the card on the player's PILE is a JOKER
                        if (s_n_m_lib_1.SMUtils.isJoker(cards[pp])) {
                            // TODO will want to build this out
                            m = new auto_move_1.AutoMove();
                            m.from = pp;
                            m.card = cards[pp][cards[pp].length - 1].cardNo;
                            m.to = gp;
                            m.score = move_enum_1.MoveScoresEnum.FROM_PILE;
                            m.isDiscard = false;
                            moves.push(m);
                        }
                        else {
                            //If the card on the player's PILE is 1 greater than the STACK then Move.
                            if (s_n_m_lib_1.SMUtils.diff(cards, pp, gp) == 1) {
                                m = new auto_move_1.AutoMove();
                                m.from = pp;
                                m.card = s_n_m_lib_1.SMUtils.getTopCard(cards[pp]);
                                m.to = gp;
                                m.score = move_enum_1.MoveScoresEnum.FROM_PILE;
                                m.isDiscard = false;
                                moves.push(m);
                                bail = true;
                                break; // no point looking at other options
                            }
                        }
                    }
                    allMoves.push(...moves);
                    moves = [];
                    break;
                case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_1 + (10 * playerIdx):
                case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_2 + (10 * playerIdx):
                case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_3 + (10 * playerIdx):
                case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_4 + (10 * playerIdx):
                case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_5 + (10 * playerIdx):
                    if (cards[pp].length > 0) {
                        let canMoveToCentre = false;
                        //  Possible moves from Hand to Centre Stack              
                        for (let gp = s_n_m_lib_1.PositionsEnum.STACK_1; gp <= s_n_m_lib_1.PositionsEnum.STACK_4; gp++) {
                            if (cards[pp].length > 0 && (s_n_m_lib_1.SMUtils.isJoker(cards[pp]) || (s_n_m_lib_1.SMUtils.diff(cards, pp, gp) == 1))) {
                                canMoveToCentre = true;
                                m = new auto_move_1.AutoMove();
                                m.from = pp;
                                m.card = cards[pp][0].cardNo;
                                m.to = gp;
                                m.score = (move_enum_1.MoveScoresEnum.PLAY_FROM_HAND + move_enum_1.MoveScoresEnum.ADD_TO_CENTER_STACK);
                                moves.push(m);
                            }
                        }
                        //  Posible moves from Hand to Player Stack (an open space)              
                        for (let ps = s_n_m_lib_1.PositionsEnum.PLAYER_STACK_1 + (10 * playerIdx); ps <= s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4 + (10 * playerIdx); ps++) {
                            if (cards[ps].length == 0 && !canMoveToCentre) { //move to center in one step.
                                m = new auto_move_1.AutoMove();
                                m.from = pp;
                                m.card = cards[pp][0].cardNo;
                                m.to = ps;
                                m.score = (move_enum_1.MoveScoresEnum.OPEN_A_SPACE + s_n_m_lib_1.SMUtils.toFaceNumber(s_n_m_lib_1.SMUtils.getTopCard(cards[ps])));
                                moves.push(m);
                            }
                        }
                    }
                    allMoves.push(...moves);
                    moves = [];
                    break;
                case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_1 + (10 * playerIdx):
                case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_2 + (10 * playerIdx):
                case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_3 + (10 * playerIdx):
                case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4 + (10 * playerIdx):
                    //    Posible moves from Player Stack to Centre Stack                
                    for (let gp = s_n_m_lib_1.PositionsEnum.STACK_1; gp <= s_n_m_lib_1.PositionsEnum.STACK_4; gp++) {
                        // console.log(`Player Hand[${pp}] cards:${cards[pp].length} topCard:${SMUtils.getFaceNumber(cards[pp])} gameStack:${SMUtils.getFaceNumber(cards[gp])} diff:${SMUtils.diff(cards, pp, gp)}`);
                        if (s_n_m_lib_1.SMUtils.isJoker(cards[pp]) || s_n_m_lib_1.SMUtils.diff(cards, pp, gp) == 1) {
                            m = new auto_move_1.AutoMove();
                            m.from = pp;
                            m.card = s_n_m_lib_1.SMUtils.getTopCard(cards[pp]);
                            m.to = gp;
                            m.score = (move_enum_1.MoveScoresEnum.PLAY_FROM_STACK + move_enum_1.MoveScoresEnum.ADD_TO_CENTER_STACK);
                            if (cards[pp].length == 1) {
                                m.score += move_enum_1.MoveScoresEnum.OPEN_A_SPACE;
                            }
                            moves.push(m);
                        }
                    }
                    allMoves.push(...moves);
                    //                console.log(`Game[${game.id}] ${SMUtils.movesToString(moves)}`);
                    moves = [];
                    break;
            }
        }
        //        Now for each move identified apply that move and see where we could move next
        if (allMoves.length > 0) {
            for (let i = 0; i < allMoves.length; i++) {
                let m = allMoves[i];
                let localCards = JSON.parse(JSON.stringify(cards));
                if (m.from == s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx)) {
                    //If this is a move from the PILE we can't look further as we don't know what the next card is.
                    possibleMoves.push(m);
                }
                else {
                    localCards = autoplay_utils_1.Utils.applyMove(localCards, m);
                    let cih = autoplay_utils_1.Utils.cardsInHand(localCards, playerIdx);
                    if (cih == 0) {
                        //Increase score of move because will get 5 new cards
                        m.score += move_enum_1.MoveScoresEnum.REFRESH_HAND;
                        possibleMoves.push(m);
                        //Stop looking for further moves until have refilled hand
                    }
                    else {
                        let nextMoves = this.findNextMoves(playerIdx, localCards, possibleMoves, depth + 1);
                        m.nextMoves = nextMoves;
                        for (let i = 0; i < m.nextMoves.length; i++) {
                            m.nextMoves[i].previousMove = m;
                        }
                        // if(m.nextMoves.length==0){
                        //     //can't find anymore moves so must discard.
                        //     let discard = this.findBestDiscard(playerIdx,localCards);
                        //     m.nextMoves=[discard];
                        //     discard.previousMove=m;
                        //     possibleMoves.push(discard);
                        // }                  
                    }
                }
            }
        }
        else {
            //can't find moves so must discard.
            let discard = this.findBestDiscard(playerIdx, cards);
            possibleMoves.push(discard);
            allMoves.push(discard);
        }
        return allMoves;
    }
    findBestDiscard(playerIdx, cards) {
        const discards = this.findDiscardMoves(playerIdx, cards);
        //    console.log(`Player.findBestDiscard() discards.length: ${discards.length}`);
        return autoplay_utils_1.Utils.getTopMove(discards);
    }
    findDiscardMoves(playerIdx, cards) {
        let moves = [];
        let m;
        const utils = autoplay_utils_1.Utils;
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
            let diffFromTo = s_n_m_lib_1.SMUtils.diff(cards, m.from, m.to);
            let diffFromPile = s_n_m_lib_1.SMUtils.diff(cards, m.from, s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx));
            let sequence = autoplay_utils_1.Utils.getSequence(cards, m.to, playerIdx);
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
            //Look at the GAME_STACKS
            //Look at the opponent's PILE & STACKS
            m.score = score;
        });
        return moves;
    }
}
exports.Player = Player;
//# sourceMappingURL=player.js.map