import { CardsEnum, ICardModel, IMoveModel, PositionsEnum, SMUtils } from 's-n-m-lib';
import { MoveScoresEnum} from './move-enum';
import { AutoMove} from './auto-move';
import { Utils } from './autoplay-utils';

export interface IPlayer{
    uuid:string;
    nextTurn(cards: ICardModel[][]):IMoveModel[];
}

export class PlayerV2 implements IPlayer{
    uuid:string;
    constructor(uuid:string, private idx:number){
        this.uuid=uuid;
    }
    nextTurn(cards: ICardModel[][]): IMoveModel[] {
        let possibleMoves:AutoMove[]=[];
        const cardsN:number[][]=Utils.cards2cardsN(cards);
        this.findNextMoves(this.idx,cardsN,possibleMoves);
        
        if(possibleMoves){
            possibleMoves.forEach((m,i)=>{
                if(m){                    
                    m.score= Utils.calculateOverallScore(m);
                }else{
                    possibleMoves.splice(i,1);
                }
            });
        }
        
        possibleMoves.sort((a:AutoMove,b:AutoMove)=>{return a.score-b.score;});
        
        let topMove:AutoMove;
        let turn:IMoveModel[]=[];
        if(possibleMoves.length>1){
            topMove=Utils.getTopMove(possibleMoves);
            
            turn=Utils.turn(topMove);
        }else if(possibleMoves.length==1){
            turn=Utils.turn(possibleMoves[0]);
        }

        return turn;
    }

    private findNextMoves(playerIdx:number,cards:number[][],possibleMoves:AutoMove[],depth:number=0):AutoMove[]{
        const used = process.memoryUsage();
        const MAX_HEAP_PERCENT:number = 0.85
        if((used.heapUsed/used.heapTotal)>=MAX_HEAP_PERCENT){
            console.log(`${JSON.stringify(used)}`);
            
            console.log(`>${MAX_HEAP_PERCENT*100}% Heap used Possible Moves:${possibleMoves.length} depth:${depth} current player: ${playerIdx}`);
            throw new Error("TOO MANY POSSIBLE MOVES");
        }
        
        let m:AutoMove;
        let moves:AutoMove[]=[];
        let allMoves:AutoMove[]=[];
        let bail=false;
        let cardsInHand:number[]=[];
    
        for(let pp:number=PositionsEnum.PLAYER_PILE+(10*playerIdx);pp<=PositionsEnum.PLAYER_STACK_4+(10*playerIdx);pp++){
            if(bail){break;}
            switch(pp){
            case PositionsEnum.PLAYER_PILE+(10*playerIdx):
                for(let gp:number=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
                    
                    //If the card on the player's PILE is a JOKER
                    if(SMUtils.isJokerN(cards[pp])){
                        // TODO will want to build this out

                        m=new AutoMove();
                        m.from=pp;
                        m.card=cards[pp][cards[pp].length-1];
                        m.to=gp;
                        m.score=MoveScoresEnum.FROM_PILE;
                        m.isDiscard=false;
                        
                        moves.push(m);
                    }else{
                        //If the card on the player's PILE is 1 greater than the STACK then Move.
                        if(SMUtils.diffN(cards,pp,gp)==1){
                            
                            m=new AutoMove();
                            m.from=pp;
                            m.card=SMUtils.getTopCardN(cards[pp]);
                            m.to=gp;
                            m.score=MoveScoresEnum.FROM_PILE;
                            m.isDiscard=false;
    
                            moves.push(m);
                            bail=true; // no point looking at other options
                            break; 
                        }
                    }
                }
                
                allMoves.push(...moves);
                moves=[];
                break;
            case PositionsEnum.PLAYER_HAND_1+(10*playerIdx):
            case PositionsEnum.PLAYER_HAND_2+(10*playerIdx):
            case PositionsEnum.PLAYER_HAND_3+(10*playerIdx):
            case PositionsEnum.PLAYER_HAND_4+(10*playerIdx):
            case PositionsEnum.PLAYER_HAND_5+(10*playerIdx):
                if(cards[pp].length>0 && cards[pp]!=undefined){  
                    // if we have seen this card in the hand before there is no point reevaluating as it will only produce the same sequence as before.
                    if(!cardsInHand.includes( SMUtils.toFaceNumber(cards[pp][0]))){
                        cardsInHand.push( SMUtils.toFaceNumber(cards[pp][0]));
                        let canMoveToCentre=false;  
                        //  Possible moves from Hand to Centre Stack              
                        for(let gp=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
                            if(!canMoveToCentre && (cards[pp].length>0 && (SMUtils.isJokerN(cards[pp]) || (SMUtils.diffN(cards,pp,gp)==1)))){
                                canMoveToCentre=true;
                                m=new AutoMove();
                                m.from=pp;
                                m.card=cards[pp][0];
                                m.to=gp;
                                m.score=(MoveScoresEnum.PLAY_FROM_HAND+MoveScoresEnum.ADD_TO_CENTER_STACK); 
                                if(SMUtils.toFaceNumber(m.card)==CardsEnum.JOKER){
                                    m.score+=MoveScoresEnum.PLAY_JOKER;
                                }

                                moves.push(m);
                            }
                        }
                    
                        //Posible moves from Hand to Player Stack (an open space)              
                        for(let ps=PositionsEnum.PLAYER_STACK_1+(10*playerIdx);ps<=PositionsEnum.PLAYER_STACK_4+(10*playerIdx);ps++){
                            if(cards[ps].length==0 && !canMoveToCentre){ //move to center in one step.
                                m=new AutoMove();
                                m.from=pp;
                                m.card=cards[pp][0];
                                m.to=ps;
                                m.score=(MoveScoresEnum.OPEN_A_SPACE+SMUtils.toFaceNumber(SMUtils.getTopCardN(cards[ps])));
                                moves.push(m);
                            }
                        }
                    }
                }
              allMoves.push(...moves);
              moves=[];
              break;
            case PositionsEnum.PLAYER_STACK_1+(10*playerIdx):
            case PositionsEnum.PLAYER_STACK_2+(10*playerIdx):
            case PositionsEnum.PLAYER_STACK_3+(10*playerIdx):
            case PositionsEnum.PLAYER_STACK_4+(10*playerIdx):
                
                let canMoveToCentre=false;  
         //    Posible moves from Player Stack to Centre Stack                
                for(let gp=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
                    if(!canMoveToCentre && (SMUtils.isJokerN(cards[pp]) || SMUtils.diffN(cards, pp, gp)==1)){
                        canMoveToCentre=true;
                        m=new AutoMove();
                        m.from=pp;
                        m.card=SMUtils.getTopCardN(cards[pp]);
                        m.to=gp;
                        m.score=(MoveScoresEnum.PLAY_FROM_STACK+MoveScoresEnum.ADD_TO_CENTER_STACK);
                        if(cards[pp].length==1){
                            m.score+=MoveScoresEnum.OPEN_A_SPACE;
                        }
                        if(SMUtils.toFaceNumber(m.card)==CardsEnum.JOKER){
                            m.score+=MoveScoresEnum.PLAY_JOKER;
                        }
                        moves.push(m);
                    }
                }
                allMoves.push(...moves);
                moves=[];
                break;               
            }
        }
    
        //Now for each move identified apply that move and see where we could move next        
        if(allMoves.length>0 ){
            for(let i=0;i<allMoves.length;i++){
                let m:AutoMove=allMoves[i];
                
                let localCards:number[][]=JSON.parse(JSON.stringify(cards));
            
                if(m.from == PositionsEnum.PLAYER_PILE+(10*playerIdx)){
                    //If this is a move from the PILE we can't look further as we don't know what the next card is.
                    possibleMoves.push(m);
                }else{
                    localCards = Utils.applyMoveN(localCards,m);
                    let cih = Utils.cardsInHandN(localCards,playerIdx);
                    
                    if(cih==0){
                        //Increase score of move because will get 5 new cards
                        m.score+=MoveScoresEnum.REFRESH_HAND;
                        //Stop looking for further moves until have refilled hand
                        possibleMoves.push(m);
                    }else{
                        let nextMoves:AutoMove[] = this.findNextMoves(playerIdx,localCards,possibleMoves,depth+1);
                        
                        m.nextMoves= nextMoves;
                        for(let i=0;i<m.nextMoves.length;i++){
                            m.nextMoves[i].previousMove=m; 
                        }         
                    }                    
                }
             }       
        }else{
            if(Utils.cardsInHandN(cards,playerIdx)>0){
                //can't find moves so must discard.
                let discard = this.findBestDiscard(playerIdx,cards);
                possibleMoves.push(discard);
                allMoves.push(discard);
            }
        }

        return allMoves;
    }

    private findBestDiscard(playerIdx:number,cards:number[][]):AutoMove{
        const discards:AutoMove[]= this.findDiscardMoves(playerIdx,cards);
        return Utils.getTopMove(discards);
    }

    private findDiscardMoves(playerIdx:number,cards:number[][]):AutoMove[]{
        let moves:AutoMove[]=[];
        let m:AutoMove;

        //find all discard options
        for(let ph=(10*playerIdx)+PositionsEnum.PLAYER_HAND_1;ph<=(10*playerIdx)+PositionsEnum.PLAYER_HAND_5;ph++){
            if(SMUtils.getTopCardN(cards[ph])!=CardsEnum.NO_CARD){
                for(let ps=(10*playerIdx)+PositionsEnum.PLAYER_STACK_1;ps<=(10*playerIdx)+PositionsEnum.PLAYER_STACK_4;ps++){
                    m=new AutoMove();
                    m.from=ph;
                    m.card=SMUtils.getTopCardN(cards[ph]);
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
            let diffFromTo:number=SMUtils.diffN(cards,m.from,m.to);
            let diffFromPile:number=SMUtils.diffN(cards,m.from,PositionsEnum.PLAYER_PILE+(10*playerIdx));
            let sequence = Utils.getSequenceN(cards[m.to]);

            //Avoid placing any other card on top of a Joker.
            if(SMUtils.toFaceNumber(cards[m.to][cards[m.to].length-1])==CardsEnum.JOKER){
                score+=MoveScoresEnum.DISCARD_ON_JOKER;
            }
            if(diffFromTo>0){
                score+=(MoveScoresEnum.DISCARD_BLOCK_SEQUENCE);
                if(sequence.length>0){
                    score+=(MoveScoresEnum.DISCARD_BLOCK_SEQUENCE * sequence.value);
                }
            }else if(diffFromTo<0){
                score+=(MoveScoresEnum.DISCARD_IN_SEQUENCE + (diffFromTo+1));
                if(diffFromPile==0){
                    score+=(MoveScoresEnum.DISCARD_BLOCK_SELF);
                }
            }else{
                score+=(MoveScoresEnum.DISCARD_BLOCK_SEQUENCE * sequence.value);
            }
            //Avoid Moving JOKERS out of Hand
            if(SMUtils.toFaceNumber( m.card)==CardsEnum.JOKER){
                score+= MoveScoresEnum.DISCARD_JOKER;
            }
            // and if necessary don't put them on a sequence because that defines the value.
            //Look at the GAME_STACKS
            //Look at the opponent's PILE & STACKS

            m.score=score;
        });
        
        return moves;
    }
}