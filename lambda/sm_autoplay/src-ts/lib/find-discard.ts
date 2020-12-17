import { CardsEnum, ICardModel, PositionsEnum, SMUtils } from "s-n-m-lib";
import { AutoMove } from "./auto-move";
import { MoveScoresEnum } from "./move-enum";

 export class DiscardMoves{

    static findDiscardMoves(playerIdx:number,cards:ICardModel[][]):AutoMove[]{
        let allMoves:AutoMove[]=[];
        let moves:AutoMove[]=[];
        let m:AutoMove;

        //check for cards that continue a sequence on the stack
            for(let ph=(10*playerIdx)+PositionsEnum.PLAYER_HAND_1;ph<=(10*playerIdx)+PositionsEnum.PLAYER_HAND_5;ph++){
                if(SMUtils.getTopCard(cards[ph])!=CardsEnum.NO_CARD){
                    for(let ps=(10*playerIdx)+PositionsEnum.PLAYER_STACK_1;ps<=(10*playerIdx)+PositionsEnum.PLAYER_STACK_4;ps++){
                    let score:number;                    
                    score = SMUtils.diff(cards, ph, ps);
                    if(score <=0){
                        //but lets not block ourselves
                        if(SMUtils.diff(cards,ph, PositionsEnum.PLAYER_PILE+(10*playerIdx))<=0){
                            score+=MoveScoresEnum.DISCARD_BLOCK_SELF;
                        }    
    
                        m=new AutoMove();
                        m.from=ph;
                        m.card=SMUtils.getTopCard(cards[ph]);
                        m.to=ps;
                        m.score=MoveScoresEnum.DISCARD_IN_SEQUENCE+score;
                        m.isDiscard=true;
                        moves.push(m);  
                    }
                }
            }
        } 
        allMoves.push(...moves);

        if(moves.length==0){
            for(let ph=(10*playerIdx)+PositionsEnum.PLAYER_HAND_1;ph<=(10*playerIdx)+PositionsEnum.PLAYER_HAND_5;ph++){
                if(SMUtils.getTopCard(cards[ph])!=CardsEnum.NO_CARD){
                    for(let ps=(10*playerIdx)+PositionsEnum.PLAYER_STACK_1;ps<=(10*playerIdx)+PositionsEnum.PLAYER_STACK_4;ps++){
                        let score:number;                    
                        score = SMUtils.diff(cards, ph, ps);
                        if(score>=0){
                            m=new AutoMove();
                            m.from=ph;
                            m.card=SMUtils.getTopCard(cards[ph]);
                            m.to=ps;
                            m.score=MoveScoresEnum.DISCARD_OUT_OF_SEQUENCE+score;
                            m.isDiscard=true;
                            moves.push(m);                            
                        }
                    }
                }
            }
        }
//        if(moves.length>0){console.log(`Discard from Hand out of sequence: \n${JSON.stringify(moves)}`);}
        allMoves.push(...moves);
        
        return allMoves;
    }
 }