import {CardsEnum, ICardModel, IMoveModel,PlayerPositionsEnum,PositionsEnum, SMUtils } from 's-n-m-lib';
import {MoveScoresEnum} from './move-enum';
import {AutoMove} from './auto-move';
import { Utils } from './autoplay-utils';

export class RoboPlayer
{
    static findMoves(player:number,cards:ICardModel[][]):IMoveModel[]{
        const moves:IMoveModel[]=[];
        return moves;
    }

    findNextMoves(playerIdx:number,cards:ICardModel[][],possibleMoves:AutoMove[],depth:number=0):AutoMove[]{
        depth+=1;
        let m:AutoMove;
        let moves:AutoMove[]=[];
        let allMoves:AutoMove[]=[];
        // let activePlayer:Player = game.players[game.activePlayer];
        let bail=false;
    
        for(let pp:number=PositionsEnum.PLAYER_PILE+(10*playerIdx);pp<=PositionsEnum.PLAYER_STACK_4+(10*playerIdx);pp++){
            if(bail){break;}
            switch(pp){
            case PositionsEnum.PLAYER_PILE:
                for(let gp:number=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
                    
                    //If the card on the player's PILE is a JOKER
                    if(SMUtils.isJoker(cards[pp])){
                        // TODO will want to build this out

                        m=new AutoMove();
                        m.from=pp;
                        m.card=cards[pp][cards[pp].length-1].cardNo;
                        m.to=gp;
                        m.score=MoveScoresEnum.FROM_PILE;
                        m.isDiscard=false;
                        
                        moves.push(m);
                    }else{
                        //If the card on the player's PILE is 1 greater than the STACK then Move.
                        if(SMUtils.diff(cards,pp,gp)==1){
                            
//                            let card1=SMUtils.toFaceNumber(cards[pp][cards[pp].length-1].cardNo);
//                            let card2=SMUtils.toFaceNumber(cards[gp][cards[gp].length-1].cardNo);
//                            console.log(`depth==${depth} pos1=${pp}/${card1}, pos2=${gp}/${card2} => ${card1 - card2}`);
                            
                            m=new AutoMove();
                            m.from=pp;
                            m.card=SMUtils.getTopCard(cards[pp]);
                            m.to=gp;
                            m.score=MoveScoresEnum.FROM_PILE;
                            m.isDiscard=false;
    
                            moves.push(m);
                            bail=true;
                            break; // no point looking at other options
                        }
                    }
                }
//                if(moves.length>0){console.log(`Move from PILE: \n${JSON.stringify(moves)}`);}
                
                allMoves.push(...moves);
                moves=[];
                break;
            case PositionsEnum.PLAYER_HAND_1+(10*playerIdx):
            case PositionsEnum.PLAYER_HAND_2+(10*playerIdx):
            case PositionsEnum.PLAYER_HAND_3+(10*playerIdx):
            case PositionsEnum.PLAYER_HAND_4+(10*playerIdx):
            case PositionsEnum.PLAYER_HAND_5+(10*playerIdx):
                if(SMUtils.getTopCard(cards[pp])!=CardsEnum.NO_CARD){  
             //  Possible moves from Hand to Centre Stack              
                  for(let gp=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
                      if(SMUtils.isJoker(cards[pp]) || (SMUtils.diff(cards,pp,gp)==1)){
                        m=new AutoMove();
                        m.from=pp;
                        m.card=SMUtils.getTopCard(cards[pp]);
                        m.to=gp;
                        m.score=(MoveScoresEnum.PLAY_FROM_HAND+MoveScoresEnum.ADD_TO_STACK); 
                        moves.push(m);
                      }
                  }
                  
             //  Posible moves from Hand to Player Stack (an open space)              
                  for(let ps=PositionsEnum.PLAYER_STACK_1+(10*playerIdx);ps<=PositionsEnum.PLAYER_STACK_4+(10*playerIdx);ps++){
                      if(SMUtils.getTopCard(cards[ps])==CardsEnum.NO_CARD){
                        m=new AutoMove();
                        m.from=pp;
                        m.card=SMUtils.getTopCard(cards[ps]);
                        m.to=ps;
                        m.score=(MoveScoresEnum.OPEN_A_SPACE+SMUtils.toFaceNumber(SMUtils.getTopCard(cards[ps])));
                        moves.push(m);
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
                
         //    Posible moves from Player Stack to Centre Stack                
                for(let gp=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
                    
                    if(SMUtils.isJoker(cards[pp]) || SMUtils.diff(cards, pp, gp)==1){
                      m=new AutoMove();
                      m.from=pp;
                      m.card=SMUtils.getTopCard(cards[pp]);
                      m.to=gp;
                      m.score=(MoveScoresEnum.PLAY_FROM_STACK+MoveScoresEnum.ADD_TO_STACK);
                      moves.push(m);
                    }
                }
                allMoves.push(...moves);
//                console.log(`Game[${game.id}] ${SMUtils.movesToString(moves)}`);
                moves=[];
                break;               
            }
        }
    
//        Now for each move identified apply that move and see where we could move next
        if(allMoves.length>0 ){
            for(let i=0;i<allMoves.length;i++){
                let m:AutoMove=allMoves[i];
                let localCards:ICardModel[][]=JSON.parse(JSON.stringify(cards));
            
                if(m.from == PositionsEnum.PLAYER_PILE+(10*playerIdx)){
                  //If this is a move from the PILE we can't look further as we don't know what the next card is.
                    possibleMoves.push(m);
                }else{
                    Utils.applyMove(localCards,m);
                    if(Utils.cardsInHand(localCards,playerIdx)==0){
                        //Increase score of move because will get 5 new cards
                        m.score+=MoveScoresEnum.REFRESH_HAND;
                        //Stop looking for further moves until have refilled hand
                    }else{
                        m.nextMoves=this.findNextMoves(playerIdx,localCards,possibleMoves,depth);
                        for(let i=0;i<m.nextMoves.length;i++){
                            m.nextMoves[i].previousMove=m; 
                        }
                                                
                        if(m.nextMoves.length==0){
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