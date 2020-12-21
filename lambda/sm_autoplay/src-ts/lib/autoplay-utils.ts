import {  Card, CardsEnum, ICardModel, IMoveModel, PositionsEnum, SMUtils } from "s-n-m-lib";
import { AutoMove } from "./auto-move";

export class Utils{
    
    static calculateOverallScore(finalMove:AutoMove):number{
        let move:AutoMove=finalMove;
        let score:number=move.score;
        let i:number=0;
        
        while(move.previousMove){
            score+=finalMove.previousMove.score;
            move=move.previousMove;
            i++;
        }
        return score;        
    }
    static allPossibleMoves(moves:AutoMove[]):AutoMove[]{
        let possibleMoves:AutoMove[]=[];

        
        if(moves){
            moves.forEach((m)=>{
                // console.log(`moves:${moves.length} next:${m.nextMoves?m.nextMoves.length:0}`);
                if(m.nextMoves.length>0){
                    possibleMoves = possibleMoves.concat(Utils.allPossibleMoves(m.nextMoves));
                    // console.log(`Next Moves - possibleMoves:${possibleMoves.length}`);
                }else{
                    possibleMoves.push(m);
                    // console.log(`possibleMoves:${possibleMoves.length}`);
                }
            });
        }
        return possibleMoves;
    }
    static turn(move:AutoMove):IMoveModel[]{
        let m:AutoMove = move;
        let turn:IMoveModel[]=[];
        let i:number=0;
        
        //build an array of moves
        turn.push(m)
        while(m.previousMove){
            turn.push(m.previousMove);
            m=m.previousMove;
        }
        turn = turn.reverse();
        return turn;
    }
    static freePlayerStacks(cards:ICardModel[][],playerIdx:number):number{
        let freePlayerStacks:number=0;
        for (let i =0;i<4;i++){
            if(cards[PositionsEnum.PLAYER_STACK_1+i+(10*playerIdx)].length==0){
                freePlayerStacks+=1;
            }
        }

        return freePlayerStacks;
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

    static getTopMove(moves:AutoMove[]):AutoMove{
        let topMoves:AutoMove[]=[];

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