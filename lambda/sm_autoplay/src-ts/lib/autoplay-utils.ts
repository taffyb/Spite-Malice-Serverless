import {  Card, ICardModel, IMoveModel, PositionsEnum, SMUtils } from "s-n-m-lib";
import { AutoMove } from "./auto-move";

export class Utils{
    
    static calculateOverallScore(finalMove:AutoMove):number{
        let move:AutoMove=finalMove;
        let score:number=move.score;
        
        while(move.previousMove){
            score+=finalMove.previousMove.score;
            move=move.previousMove;
        }
        return score;        
    }

    static applyMove(cards:ICardModel[][],move:IMoveModel){
        cards[move.from].pop;
        cards[move.to].push(new Card(move.card,move.to));
    }
    static cardsInHand(cards:ICardModel[][],playerIdx:number):number{
        let cardsInHand=5;
        for(let h=0;h<=4;h++){
            if(cards[PositionsEnum.PLAYER_HAND_1+(playerIdx*10)+h].length>0){
                cardsInHand -=1;
            }
        }
        return cardsInHand;
    }
    static cardsFromArray(inArr:number[][]):ICardModel[][]{
        
        const cards:ICardModel[][]=[];

        for(let pos:number=PositionsEnum.PLAYER_PILE;pos<=PositionsEnum.RECYCLE;pos++){
            cards.push([]);
            for(let c:number=0;c<inArr[pos].length;c++){
                cards[pos].push(new Card(inArr[pos][c],pos));
            }
        }
        return cards;
    }
    static getSequence(cards:ICardModel[][],p:number, playerIdx:number=0):{length:number,value:number}{
        let sequenceLength:number=1;
        let sequenceValue:number=0;

        if(cards[p].length>1){
            const start=SMUtils.toFaceNumber(cards[p][cards[p].length-1].cardNo);
            const topOfPile:number = SMUtils.getTopCard(cards[PositionsEnum.PLAYER_PILE+(10*playerIdx)]);
            let c:number = start;
            for(let i=cards[p].length-2;i>=0;i--){
                let nextCard = SMUtils.toFaceNumber(cards[p][i].cardNo)
                if(nextCard>c){
                    sequenceLength++;
                    c=nextCard;
                }else{
                    break;
                }
            }
            sequenceValue=((SMUtils.toFaceNumber(cards[p][cards[p].length-(sequenceLength)].cardNo)-start)/(sequenceLength-1));
        }
        // console.log(`{${sequenceLength},${sequenceValue}}`);
        return {length:sequenceLength,value:sequenceValue};
    }

    static getTopMove(moves:AutoMove[]):IMoveModel{
        let topMove:AutoMove=moves[0];

        moves.forEach((m:AutoMove)=>{
            if(m.score>topMove.score){
                topMove = m;
            }
        });
        return topMove;
    }
}