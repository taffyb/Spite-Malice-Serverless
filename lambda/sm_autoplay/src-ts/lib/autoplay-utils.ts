import {  Card, ICardModel, IMoveModel, PositionsEnum } from "s-n-m-lib";
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
}