import {IPlayerModel, IMoveModel, Card, PositionsEnum, PlayerPositionsEnum, CardsEnum, MoveTypesEnum} from 's-n-m-lib';
import {SMUtils} from 's-n-m-lib';
import {RoboMove, MoveWeightsEnum} from './robo.move';

export class RoboPlayer implements IPlayerModel {
    uuid = '007';
    name = 'Robo';

    private moves: RoboMove[] = [];

    findNextMove(activePlayer: number, cards: Card[][]): IMoveModel[] {
        const nextMoves: IMoveModel[] = this.findBestMoves(this.findAllPossibleMoves(activePlayer, cards, []));
        nextMoves.push(... nextMoves);
        return null;
    }

    findBestDiscard(activePlayer: number, cards: Card[][]): RoboMove {
        return null;
    }
    findBestMoves(possibleMoves: RoboMove[]): IMoveModel[] {
        return null;
    }
    findAllPossibleMoves(activePlayer: number, cards: Card[][], possibleMoves: RoboMove[]): RoboMove[] {
        let bail = false;
        const APO = activePlayer * 10; // Active Player Offset
        let m: RoboMove;
        let ms: RoboMove[] = [];
        const allMoves: RoboMove[] = [];

        for (let pp: number = PositionsEnum.PLAYER_PILE + APO; pp <= PositionsEnum.STACK_4 + APO; pp++) {
            if (bail) {break; }
            switch (pp) {
            case PositionsEnum.PLAYER_PILE + APO:
                for (let gp: number = PositionsEnum.STACK_1; gp <= PositionsEnum.STACK_4; gp++) {

                    if (this.isJoker(this.topCard(cards[ pp]))) {
                        // TODO will want to build this out

                        m = new RoboMove();
                        m.from = pp;
                        m.card = this.topCard(cards[pp]).cardNo;
                        m.to = gp;
                        m.score = MoveWeightsEnum.FROM_PILE;
                        m.isDiscard = false;

                        ms.push(m);
                    } else {
                        if (this.difference(cards, pp, gp) === 1) {

//                            const card1 = SMUtils.toFaceNumber(SMUtils.cardValue(game, activePlayer, pp));
//                            const card2 = SMUtils.toFaceNumber(SMUtils.cardValue(game, activePlayer, gp));
//                            console.log(`depth==${depth} pos1=${pp}/${card1}, pos2=${gp}/${card2} => ${card1 - card2}`);

                            m = new RoboMove();
                            m.from = pp;
                            m.card = this.topCard(cards[pp]).cardNo;
                            m.to = gp;
                            m.score = MoveWeightsEnum.FROM_PILE;
                            m.isDiscard = false;

                            ms.push(m);
                            bail = true;
                            break; // no point looking at other options
                        }
                    }
                }
//                    if(moves.length>0){console.log(`Move from PILE: \n${JSON.stringify(moves)}`);}

                allMoves.push(...ms);
                ms = [];
                break;
            case PositionsEnum.PLAYER_HAND_1 + APO:
            case PositionsEnum.PLAYER_HAND_2 + APO:
            case PositionsEnum.PLAYER_HAND_3 + APO:
            case PositionsEnum.PLAYER_HAND_4 + APO:
            case PositionsEnum.PLAYER_HAND_5 + APO:
                if (SMUtils.toFaceNumber(this.topCard(cards[pp]).cardNo) !== CardsEnum.NO_CARD) {
    //            Possible moves from Hand to Centre Stack
                  for (let gp = PositionsEnum.STACK_1; gp <= PositionsEnum.STACK_4; gp++) {
                      if (this.isJoker(this.topCard(cards[ pp])) ||
                      this.difference(cards, pp, gp) === 1) {
                        m = new RoboMove();
                        m.from = pp;
                        m.card = this.topCard(cards[pp]).cardNo;
                        m.to = gp;
                        m.score = (MoveWeightsEnum.PLAY_FROM_HAND + MoveWeightsEnum.ADD_TO_STACK);
                        ms.push(m);
                      }
                  }

    //            Posible moves from Hand to Player Stack (an open space)
                  for (let ps = PositionsEnum.STACK_1; ps <= PositionsEnum.STACK_4; ps++) {
                      if (SMUtils.toFaceNumber(this.topCard(cards[ps]).cardNo) === CardsEnum.NO_CARD) {
                        m = new RoboMove();
                        m.from = pp;
                        m.card = this.topCard(cards[pp]).cardNo;
                        m.to = ps;
                        m.score = (MoveWeightsEnum.OPEN_A_SPACE + SMUtils.toFaceNumber(this.topCard(cards[pp]).cardNo));
                        ms.push(m);
                      }
                  }
                }
              allMoves.push(...ms);
              ms = [];
              break;
            case PositionsEnum.PLAYER_STACK_1 + APO:
            case PositionsEnum.PLAYER_STACK_2 + APO:
            case PositionsEnum.PLAYER_STACK_3 + APO:
            case PositionsEnum.PLAYER_STACK_4 + APO:

//                  Posible moves from Player Stack to Centre Stack
                for (let gp = PositionsEnum.STACK_1; gp <= PositionsEnum.STACK_4; gp++) {

                    if (this.isJoker(this.topCard(cards[pp])) ||
                    this.difference(cards, pp, gp) === 1) {
                      m = new RoboMove();
                      m.from = pp;
                      m.card = this.topCard(cards[pp]).cardNo;
                      m.to = gp;
                      m.score = (MoveWeightsEnum.PLAY_FROM_STACK + MoveWeightsEnum.ADD_TO_STACK);
                      ms.push(m);
                    }
                }
                allMoves.push(...ms);
//                    console.log(`Game[${game.id}] ${SMUtils.movesToString(moves)}`);
                ms = [];
                break;
            }
        }

//            Now for each move identified apply that move and see where we could move next
        if (allMoves.length > 0 ) {
            for (let i = 0; i < allMoves.length; i++) {
                m = allMoves[i];
                const localCards: Card[][] = JSON.parse(JSON.stringify(cards));

                if (m.from === PositionsEnum.PLAYER_PILE + APO) {
                  // If this is a move from the PILE we can't look further as we don't know what the next card is.
                    possibleMoves.push(m);
                } else {
                    this.applyMove(localCards, m);
                    if (!this.hasCardsInHand(cards, APO)) {
                        // Increase score of move because will get 5 new cards
                        m.score += MoveWeightsEnum.NEW_HAND;
                        // Stop looking for further moves until have refilled hand
                    } else {
                        m.nextMoves = this.findAllPossibleMoves(activePlayer, localCards, possibleMoves);
                        for (let j = 0; j < m.nextMoves.length; j++) {
                           m.nextMoves[j].previousMove = m;
                        }
                        if (m.nextMoves.length === 0) {
                            // add to possible moves
                            possibleMoves.push(m);
                        }
                    }
                }
             }
//                 console.log(`allMoves(${depth}:\n${SMUtils.movesToString(allMoves)}`);
        } else {
            allMoves.push(this.findBestDiscard(activePlayer, cards));
        }
        return allMoves;
    }
    topCard(cards: Card[]): Card {

        if (cards.length === 0) {
            return new Card(CardsEnum.NO_CARD, 0);
        } else {
            return cards[cards.length - 1];
        }
    }
    isJoker(card: Card): boolean {
        let isJoker = false;

        isJoker = (card.cardNo === CardsEnum.JOKER);
        return isJoker;
    }
    difference(allCards: Card[][], position1: number, position2: number): number {
        const card1: Card = this.topCard(allCards[position1]);
        const card2: Card = this.topCard(allCards[position2]);

        const dif = SMUtils.toFaceNumber(card1.cardNo) - SMUtils.toFaceNumber(card2.cardNo);

        return dif;
    }
    hasCardsInHand(cards: Card[][], APO: number): boolean {
        let cardsInHand = false;

        for (let h: number = PositionsEnum.PLAYER_HAND_1 + APO; h <= PositionsEnum.PLAYER_HAND_5 + APO; h++) {
            if (cards[h].length > 0) {
                cardsInHand = true;
                break;
            }
        }
        return cardsInHand;
    }
    applyMove(cards: Card[][], move: IMoveModel) {
        const card = cards[move.from].pop();
        cards[move.to].push(card);

    }
    calculateOverallScore(finalMove: RoboMove): number {
        let move: RoboMove = finalMove;
        let score: number = move.score;

        while (move.previousMove) {
            score += finalMove.previousMove.score;
            move = move.previousMove;
        }
        return score;
    }
}
