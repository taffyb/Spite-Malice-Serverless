"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const move_enum_1 = require("./move-enum");
const auto_move_1 = require("./auto-move");
const autoplay_utils_1 = require("./autoplay-utils");
class PlayerV2 {
    constructor(uuid, idx) {
        this.idx = idx;
        this.uuid = uuid;
    }
    nextTurn(cards) {
        const cardsN = autoplay_utils_1.Utils.cards2cardsN(cards);
        this.possibleMoves = [];
        let bestMove;
        let turn = [];
        bestMove = this.findBestPileMove(this.idx, cardsN);
        if (bestMove !== null) {
            turn = autoplay_utils_1.Utils.turn(bestMove);
        }
        else {
            bestMove = this.findBestNonPileMove(this.idx, cardsN);
            if (bestMove) {
                turn = autoplay_utils_1.Utils.turn(bestMove);
            }
        }
        return turn;
    }
    findBestNonPileMove(playerIdx, cards) {
        let bestNonPileMove;
        let allPossibleNonPileMoves = [];
        this.findBestPossibleNonPileMoves(playerIdx, cards, allPossibleNonPileMoves);
        if (allPossibleNonPileMoves.length > 0) {
            allPossibleNonPileMoves.forEach((m) => {
                m.score = autoplay_utils_1.Utils.calculateOverallScore(m);
            });
            allPossibleNonPileMoves = allPossibleNonPileMoves.sort((a, b) => {
                return (b.score - a.score);
            });
            bestNonPileMove = allPossibleNonPileMoves[0];
        }
        return bestNonPileMove;
    }
    findBestPossibleNonPileMoves(playerIdx, cards, possibelPileMoves) {
        let findBestPossibleNonPileMove = [];
        let m;
        let gameCards = [];
        for (let gp = s_n_m_lib_1.PositionsEnum.STACK_1; gp <= s_n_m_lib_1.PositionsEnum.STACK_4; gp++) {
            let gameCard = s_n_m_lib_1.SMUtils.getFaceNumberN(cards[gp]);
            let stopLooking = false;
            if (!gameCards.includes(gameCard)) { //there is no point working out all possible moves as this has already been evaluated.
                gameCards.push(gameCard);
                for (let pp = s_n_m_lib_1.PositionsEnum.PLAYER_HAND_1 + (10 * playerIdx); pp <= s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4 + (10 * playerIdx); pp++) {
                    if (stopLooking) {
                        break;
                    }
                    let playerCard;
                    switch (pp) {
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_1 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_2 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_3 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_4 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_5 + (10 * playerIdx):
                            if (cards[pp].length > 0) {
                                playerCard = cards[pp][0];
                                if (s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == s_n_m_lib_1.CardsEnum.JOKER) {
                                    m = new auto_move_1.AutoMove();
                                    m.from = pp;
                                    m.to = gp;
                                    m.card = playerCard;
                                    m.type = s_n_m_lib_1.MoveTypesEnum.PLAYER;
                                    m.playerUuid = this.uuid;
                                    m.score = move_enum_1.MoveScoresEnum.PLAY_FROM_HAND + move_enum_1.MoveScoresEnum.PLAY_JOKER;
                                    findBestPossibleNonPileMove.push(m);
                                }
                                else if (s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == gameCard + 1) {
                                    m = new auto_move_1.AutoMove();
                                    m.from = pp;
                                    m.to = gp;
                                    m.card = playerCard;
                                    m.type = s_n_m_lib_1.MoveTypesEnum.PLAYER;
                                    m.playerUuid = this.uuid;
                                    m.score = move_enum_1.MoveScoresEnum.PLAY_FROM_HAND;
                                    findBestPossibleNonPileMove.push(m);
                                }
                                if (gp == s_n_m_lib_1.PositionsEnum.STACK_1) { //there is no point in checking more than once.
                                    for (let ps = s_n_m_lib_1.PositionsEnum.PLAYER_STACK_1 + (10 * playerIdx); ps <= s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4 + (10 * playerIdx); ps++) {
                                        if (cards[ps].length == 0) {
                                            m = new auto_move_1.AutoMove();
                                            m.from = pp;
                                            m.to = ps;
                                            m.card = playerCard;
                                            m.type = s_n_m_lib_1.MoveTypesEnum.PLAYER;
                                            m.playerUuid = this.uuid;
                                            m.score = move_enum_1.MoveScoresEnum.OPEN_A_SPACE;
                                            findBestPossibleNonPileMove.push(m);
                                            break; // can only move to one open space doesn't matter which one.
                                        }
                                    }
                                }
                            }
                            break;
                        case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_1 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_2 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_3 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4 + (10 * playerIdx):
                            if (cards[pp].length > 0) {
                                playerCard = cards[pp][cards[pp].length - 1];
                                if (s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == s_n_m_lib_1.CardsEnum.JOKER || s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == gameCard + 1) {
                                    m = new auto_move_1.AutoMove();
                                    m.from = pp;
                                    m.to = gp;
                                    m.card = playerCard;
                                    m.type = s_n_m_lib_1.MoveTypesEnum.PLAYER;
                                    m.playerUuid = this.uuid;
                                    m.score = move_enum_1.MoveScoresEnum.PLAY_FROM_STACK;
                                    //if last card on player stack increase score
                                    if (cards[pp].length == 1) {
                                        m.score += move_enum_1.MoveScoresEnum.OPEN_A_SPACE;
                                    }
                                    findBestPossibleNonPileMove.push(m);
                                }
                            }
                            break;
                    }
                }
            }
        }
        let localCards = JSON.parse(JSON.stringify(cards));
        if (findBestPossibleNonPileMove.length > 0) {
            findBestPossibleNonPileMove.forEach((m) => {
                autoplay_utils_1.Utils.applyMoveN(localCards, m);
                if (autoplay_utils_1.Utils.cardsInHand(localCards, playerIdx) == 0) {
                    possibelPileMoves.push(m);
                }
                else {
                    const nextMoves = this.findBestPossibleNonPileMoves(playerIdx, localCards, possibelPileMoves);
                    if (nextMoves.length > 0) {
                        nextMoves.forEach((nextMove) => {
                            nextMove.previousMove = m;
                            nextMove.length = m.length + 1;
                            m.nextMoves.push(nextMove);
                        });
                    }
                    else {
                        if (autoplay_utils_1.Utils.cardsInHand(localCards, playerIdx) > 0) {
                            let discard = this.findBestDiscard(playerIdx, localCards);
                            discard.previousMove = m;
                            discard.nextMoves = [];
                            possibelPileMoves.push(discard);
                        }
                    }
                }
            });
        }
        else {
            if (autoplay_utils_1.Utils.cardsInHand(localCards, playerIdx) > 0) {
                // console.log(`Discard [${this.idx}]\n${Utils.cardsNToString(localCards)}`);
                let discard = this.findBestDiscard(playerIdx, localCards);
                discard.previousMove = m;
                discard.nextMoves = [];
                possibelPileMoves.push(discard);
            }
        }
        return findBestPossibleNonPileMove;
    }
    findBestPileMove(playerIdx, cards) {
        let bestMove = null;
        let allPossiblePileMoves = [];
        if (this.couldPlayPile(playerIdx, cards)) { // don't bother looking for a sequence of moves if couldn't possibly play the pile 
            let possiblePileMoves = [];
            this.findPossiblePileMoves(playerIdx, cards, allPossiblePileMoves);
            if (allPossiblePileMoves.length > 0) {
                //sort the moves by length - we want the shortest sequence of moves to get to the pile
                allPossiblePileMoves = allPossiblePileMoves.sort((a, b) => {
                    return (a.length - b.length);
                });
                let moveLength = allPossiblePileMoves[0].length;
                for (let i = 0; i < allPossiblePileMoves.length; i++) {
                    let m = allPossiblePileMoves[i];
                    if (m.length == moveLength) {
                        possiblePileMoves.push(m);
                    }
                    else {
                        break;
                    }
                }
                // if there is move than 1 possible move to reach the pile calculate their scores and pick the best one
                if (possiblePileMoves.length > 1) {
                    possiblePileMoves.forEach((m) => {
                        m.score = autoplay_utils_1.Utils.calculateOverallScore(m);
                    });
                    possiblePileMoves = possiblePileMoves.sort((a, b) => {
                        return (b.score - a.score);
                    });
                    bestMove = possiblePileMoves[0];
                }
            }
        }
        return bestMove;
    }
    findPossiblePileMoves(playerIdx, cards, possibelPileMoves) {
        let findPossiblePileMoves = [];
        let m;
        let gameCards = [];
        let pileCard;
        for (let gp = s_n_m_lib_1.PositionsEnum.STACK_1; gp <= s_n_m_lib_1.PositionsEnum.STACK_4; gp++) {
            let gameCard = s_n_m_lib_1.SMUtils.getFaceNumberN(cards[gp]);
            let stopLooking = false;
            if (!gameCards.includes(gameCard)) { //there is no point working out all possible moves as this has already been evaluated.
                gameCards.push(gameCard);
                for (let pp = s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx); pp <= s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4 + (10 * playerIdx); pp++) {
                    if (stopLooking) {
                        break;
                    }
                    let playerCard;
                    switch (pp) {
                        case s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx):
                            if (cards[pp].length > 0) {
                                playerCard = cards[pp][cards[pp].length - 1];
                                if (s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == s_n_m_lib_1.CardsEnum.JOKER) {
                                    m = new auto_move_1.AutoMove();
                                    m.from = pp;
                                    m.to = gp;
                                    m.card = playerCard;
                                    m.type = s_n_m_lib_1.MoveTypesEnum.PLAYER;
                                    m.playerUuid = this.uuid;
                                    m.score = move_enum_1.MoveScoresEnum.FROM_PILE;
                                    findPossiblePileMoves.push(m);
                                }
                                else if (s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == gameCard + 1) {
                                    m = new auto_move_1.AutoMove();
                                    m.from = pp;
                                    m.to = gp;
                                    m.card = playerCard;
                                    m.type = s_n_m_lib_1.MoveTypesEnum.PLAYER;
                                    m.playerUuid = this.uuid;
                                    m.score = move_enum_1.MoveScoresEnum.PLAY_FROM_HAND;
                                    findPossiblePileMoves.push(m);
                                }
                            }
                            break;
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_1 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_2 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_3 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_4 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_HAND_5 + (10 * playerIdx):
                            if (cards[pp].length > 0) {
                                playerCard = cards[pp][0];
                                if (s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == s_n_m_lib_1.CardsEnum.JOKER) {
                                    m = new auto_move_1.AutoMove();
                                    m.from = pp;
                                    m.to = gp;
                                    m.card = playerCard;
                                    m.type = s_n_m_lib_1.MoveTypesEnum.PLAYER;
                                    m.playerUuid = this.uuid;
                                    m.score = move_enum_1.MoveScoresEnum.PLAY_FROM_HAND + move_enum_1.MoveScoresEnum.PLAY_JOKER;
                                    findPossiblePileMoves.push(m);
                                }
                                else if (s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == gameCard + 1) {
                                    m = new auto_move_1.AutoMove();
                                    m.from = pp;
                                    m.to = gp;
                                    m.card = playerCard;
                                    m.type = s_n_m_lib_1.MoveTypesEnum.PLAYER;
                                    m.playerUuid = this.uuid;
                                    m.score = move_enum_1.MoveScoresEnum.PLAY_FROM_HAND;
                                    findPossiblePileMoves.push(m);
                                }
                            }
                            break;
                        case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_1 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_2 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_3 + (10 * playerIdx):
                        case s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4 + (10 * playerIdx):
                            if (cards[pp].length > 0) {
                                playerCard = cards[pp][cards[pp].length - 1];
                                if (s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == s_n_m_lib_1.CardsEnum.JOKER || s_n_m_lib_1.SMUtils.toFaceNumber(playerCard) == gameCard + 1) {
                                    m = new auto_move_1.AutoMove();
                                    m.from = pp;
                                    m.to = gp;
                                    m.card = playerCard;
                                    m.type = s_n_m_lib_1.MoveTypesEnum.PLAYER;
                                    m.playerUuid = this.uuid;
                                    m.score = move_enum_1.MoveScoresEnum.PLAY_FROM_STACK;
                                    //if last card on player stack increase score
                                    if (cards[pp].length == 1) {
                                        m.score += move_enum_1.MoveScoresEnum.OPEN_A_SPACE;
                                    }
                                    findPossiblePileMoves.push(m);
                                }
                            }
                            break;
                    }
                }
            }
        }
        findPossiblePileMoves.forEach((m) => {
            if (m.from != s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx)) {
                let localCards = JSON.parse(JSON.stringify(cards));
                autoplay_utils_1.Utils.applyMoveN(localCards, m);
                const nextMoves = this.findPossiblePileMoves(playerIdx, localCards, possibelPileMoves);
                nextMoves.forEach((nextMove) => {
                    nextMove.previousMove = m;
                    nextMove.length = m.length + 1;
                    m.nextMoves.push(nextMove);
                });
            }
            else {
                possibelPileMoves.push(m);
            }
        });
        return findPossiblePileMoves;
    }
    findBestDiscard(playerIdx, cards) {
        const discards = this.findDiscardMoves(playerIdx, cards);
        const bestDiscard = autoplay_utils_1.Utils.getTopMove(discards);
        //         console.log(`Best Move: ${Utils.moveToString(bestDiscard)}`);
        return bestDiscard;
    }
    findDiscardMoves(playerIdx, cards) {
        let moves = [];
        let m;
        let pile = cards[s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * this.idx)];
        let pileCard = pile[pile.length - 1];
        //find all discard options
        for (let ph = (10 * playerIdx) + s_n_m_lib_1.PositionsEnum.PLAYER_HAND_1; ph <= (10 * playerIdx) + s_n_m_lib_1.PositionsEnum.PLAYER_HAND_5; ph++) {
            if (s_n_m_lib_1.SMUtils.getTopCardN(cards[ph]) != s_n_m_lib_1.CardsEnum.NO_CARD) {
                for (let ps = (10 * playerIdx) + s_n_m_lib_1.PositionsEnum.PLAYER_STACK_1; ps <= (10 * playerIdx) + s_n_m_lib_1.PositionsEnum.PLAYER_STACK_4; ps++) {
                    m = new auto_move_1.AutoMove();
                    m.from = ph;
                    m.card = s_n_m_lib_1.SMUtils.getTopCardN(cards[ph]);
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
            let diffFromTo = s_n_m_lib_1.SMUtils.diffN(cards, m.from, m.to);
            let diffFromPile = s_n_m_lib_1.SMUtils.diffN(cards, m.from, s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * playerIdx));
            let sequence = autoplay_utils_1.Utils.getSequenceN(cards[m.to]);
            //Avoid Moving JOKERS out of Hand
            if (s_n_m_lib_1.SMUtils.toFaceNumber(m.card) == s_n_m_lib_1.CardsEnum.JOKER) {
                score += move_enum_1.MoveScoresEnum.DISCARD_JOKER;
                // and if necessary don't put them on a sequence because that defines the value.                
                if (sequence.length > 0) {
                    score += (move_enum_1.MoveScoresEnum.DISCARD_BLOCK_SEQUENCE * sequence.value);
                }
            }
            //Avoid placing any other card on top of a Joker.
            if (s_n_m_lib_1.SMUtils.toFaceNumber(cards[m.to][cards[m.to].length - 1]) == s_n_m_lib_1.CardsEnum.JOKER) {
                score += move_enum_1.MoveScoresEnum.DISCARD_ON_JOKER;
            }
            //is it in sequence?
            if (diffFromTo < 0) {
                score += (move_enum_1.MoveScoresEnum.DISCARD_IN_SEQUENCE + (diffFromTo + 1));
                if (diffFromPile == 0) {
                    score += (move_enum_1.MoveScoresEnum.DISCARD_BLOCK_SELF);
                }
            }
            else { //It is going to block
                if (sequence.length > 0) {
                    score += (move_enum_1.MoveScoresEnum.DISCARD_BLOCK_SEQUENCE * (sequence.value * sequence.length));
                }
                score += diffFromTo;
            }
            //Look at the GAME_STACKS
            let closestStackCard = s_n_m_lib_1.SMUtils.getFaceNumberN(cards[autoplay_utils_1.Utils.closestStackToPile(cards, this.idx)]);
            if (pileCard > closestStackCard) {
                if (m.card < pileCard && m.card > closestStackCard) {
                    score += move_enum_1.MoveScoresEnum.DISCARD_CLOSER_TO_PILE;
                }
            }
            else {
                if (m.card < pileCard || m.card > closestStackCard) {
                    score += move_enum_1.MoveScoresEnum.DISCARD_CLOSER_TO_PILE;
                }
            }
            //Look at the opponent's PILE & STACKS
            m.score = score;
        });
        return moves;
    }
    couldPlayPile(playerIdx, cards) {
        let couldPlayPile = false;
        let distanceToPile = [];
        let flatHand = autoplay_utils_1.Utils.flattenHand(cards, playerIdx);
        let pp = cards[s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (playerIdx * 10)];
        let pileCard = s_n_m_lib_1.SMUtils.toFaceNumber(pp[pp.length - 1]);
        if (pileCard === s_n_m_lib_1.CardsEnum.JOKER) { //JOKER Can allways be played
            return true;
        }
        else {
            // Check each game pile
            for (let gp = s_n_m_lib_1.PositionsEnum.STACK_1; gp <= s_n_m_lib_1.PositionsEnum.STACK_4; gp++) {
                let gameStack = cards[gp];
                let gameCard = (gameStack.length > 0 ? s_n_m_lib_1.SMUtils.toFaceNumber(gameStack[gameStack.length - 1]) : 0);
                if (pileCard == gameCard) {
                    distanceToPile[gp] = 13;
                }
                else {
                    if (pileCard > gameCard) {
                        distanceToPile[gp] = pileCard - gameCard;
                    }
                    else {
                        distanceToPile[gp] = 13 - (gameCard - pileCard);
                    }
                }
            }
        }
        for (let gp = s_n_m_lib_1.PositionsEnum.STACK_1; gp <= s_n_m_lib_1.PositionsEnum.STACK_4; gp++) {
            if (distanceToPile[gp] == 1) { // if the distance to the pile is only 1 then can move directly
                couldPlayPile = true;
                break;
            }
            else {
                let gameStack = cards[gp];
                let gameCard = (gameStack.length > 0 ? s_n_m_lib_1.SMUtils.toFaceNumber(gameStack[gameStack.length - 1]) : 0);
                let requiredCard;
                if ((flatHand.length - 1) >= distanceToPile[gp]) { //check that the hand contains enough cards to possibly reach the pile.
                    couldPlayPile = true;
                    for (let c = 1; c < distanceToPile[gp] - 1; c++) { //check that all the cards needed to reach the pile are in the players hand
                        requiredCard = gameCard + c;
                        if (gameCard + c > s_n_m_lib_1.CardsEnum.KING) {
                            requiredCard -= s_n_m_lib_1.CardsEnum.KING;
                        }
                        if (!flatHand.includes(requiredCard)) {
                            couldPlayPile = false;
                            break;
                        }
                    }
                    if (couldPlayPile) {
                        break; // once we know it is possible we can stop looking
                    }
                }
            }
        }
        return couldPlayPile;
    }
}
exports.PlayerV2 = PlayerV2;
//# sourceMappingURL=player.js.map