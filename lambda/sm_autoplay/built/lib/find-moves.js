"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const move_enum_1 = require("./move-enum");
const auto_move_1 = require("./auto-move");
const autoplay_utils_1 = require("./autoplay-utils");
class RoboPlayer {
    static findMoves(playerIdx, cards) {
        let allPossibleMoves = [];
        this.findNextMoves(playerIdx, cards, allPossibleMoves);
        return allPossibleMoves;
    }
    static findNextMoves(playerIdx, cards, possibleMoves, depth = 0) {
        // console.log(`findNextMoves:${depth}`);
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
                            if (s_n_m_lib_1.SMUtils.isJoker(cards[pp]) || (s_n_m_lib_1.SMUtils.diff(cards, pp, gp) == 1)) {
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
                        if (m.nextMoves.length == 0) {
                            //add to possible moves
                            possibleMoves.push(m);
                        }
                    }
                }
            }
        }
        return allMoves;
    }
}
exports.RoboPlayer = RoboPlayer;
//# sourceMappingURL=find-moves.js.map