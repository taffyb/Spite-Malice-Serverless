import { CardsEnum, ICardModel, PositionsEnum, SMUtils } from "s-n-m-lib";
import { AutoMove } from "./auto-move";
import { Utils } from "./autoplay-utils";
import { MoveScoresEnum } from "./move-enum";

 export class DiscardMoves{

    static findDiscardMoves(playerIdx:number,cards:ICardModel[][]):AutoMove[]{
        let moves:AutoMove[]=[];
        let m:AutoMove;

        //find all discard options
        for(let ph=(10*playerIdx)+PositionsEnum.PLAYER_HAND_1;ph<=(10*playerIdx)+PositionsEnum.PLAYER_HAND_5;ph++){
            if(SMUtils.getTopCard(cards[ph])!=CardsEnum.NO_CARD){
                for(let ps=(10*playerIdx)+PositionsEnum.PLAYER_STACK_1;ps<=(10*playerIdx)+PositionsEnum.PLAYER_STACK_4;ps++){
                    m=new AutoMove();
                    m.from=ph;
                    m.card=SMUtils.getTopCard(cards[ph]);
                    m.to=ps;
                    m.score=0;
                    m.isDiscard=true;
                    moves.push(m);
                }
            }
        }
        //score each move
        moves.forEach((m)=>{
            let score:number=0;
            //does it continue a sequence?
            let diffFromTo:number=SMUtils.diff(cards,m.from,m.to);
            let diffFromPile:number=SMUtils.diff(cards,m.from,PositionsEnum.PLAYER_PILE+(10*playerIdx));
            let sequence = Utils.getSequence(cards,m.to,playerIdx);
            // console.log(`diffFromTo: ${diffFromTo}`);
            if(diffFromTo==0){
                score+=(MoveScoresEnum.DISCARD_IN_SEQUENCE);
                if(sequence.length>1){
                    score+=(MoveScoresEnum.DISCARD_BLOCK_SEQUENCE+ sequence.value);
                }
            }else if(diffFromTo<0){
                score+=(MoveScoresEnum.DISCARD_IN_SEQUENCE +(diffFromTo+1));
                if(diffFromPile==0){
                    score+=(MoveScoresEnum.DISCARD_BLOCK_SELF);
                }
            }else{
                score+=(MoveScoresEnum.DISCARD_BLOCK_SEQUENCE+ sequence.value);
            }
                  
            m.score=score;
        });
        
        return moves;
    }
 }
