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

    static applyMove(cards:ICardModel[][],move:IMoveModel):ICardModel[][]{
        cards[move.from].pop();
        cards[move.to].push(new Card(move.card,move.to));

        return cards;
    }
    static cardsInHand(cards:ICardModel[][],playerIdx:number):number{
        let cardsInHand=5;
        for(let h=0;h<5;h++){
            if(cards[PositionsEnum.PLAYER_HAND_1+(playerIdx*10)+h].length==0){
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
        let topMoves:IMoveModel[]=[];

        //sort moves by score
        moves.sort((a:AutoMove,b:AutoMove)=>{return b.score-a.score});
        let topScore = moves[0].score
        //collect all moves with the highest score
        // console.log(`TopScore:${topScore}`)
        for( let i=0;i<moves.length;i++){
            let m:AutoMove = moves[i];
            if(m.score==topScore){
                topMoves.push(m);
            }else{
                break;
            }
        }
        // console.log(`topMoves.length:${topMoves.length}`)
        // randomly pick of the top moves
        let topMoveIdx:number = Math.floor( Math.random()*(topMoves.length))+1;
        return topMoves[topMoveIdx-1];
    }
    static cardsToString(cards:ICardModel[][]):string{
        let out:string="";

        cards.forEach((pos:ICardModel[],posIdx:number)=>{
            out+="[";
            pos.forEach((c:ICardModel,cIdx:number)=>{
                out+=c.cardNo;
                if(cIdx!=pos.length-1){
                    out+=",";
                }
            });
            out+="]";
            if(posIdx!=cards.length-1){
                out+=",";
            }
            out+="\n";
        });
        return out;
    }
}