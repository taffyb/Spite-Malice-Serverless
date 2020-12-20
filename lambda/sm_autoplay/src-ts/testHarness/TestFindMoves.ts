import { CardsEnum, ICardModel, IMoveModel, PositionsEnum } from 's-n-m-lib';
import { AutoMove } from '../lib/auto-move';
import { Utils } from '../lib/autoplay-utils';
import { RoboPlayer } from '../lib/find-moves';
import {cards as inArr} from '../tests/find-moves-refill_hand';

export class TestFindMoves{
    static execute():boolean{
        let cards:ICardModel[][]=Utils.cardsFromArray(inArr);
        const moves:AutoMove[]= RoboPlayer.findMoves(0,cards);

        // console.log(`{cards:${JSON.stringify(cards)}`);
        moves.sort((a:AutoMove,b:AutoMove)=>{return a.from-b.from;});
        moves.forEach((m)=>{
            console.log(`{from:${PositionsEnum[ m.from]},card:${CardsEnum[ m.card]},to:${PositionsEnum[ m.to]},score:${m.score}}`);
        });
        let topMove:IMoveModel=null;
        if(moves.length>1){
            topMove=Utils.getTopMove(moves);
        }else if(moves.length==1){
            topMove=moves[0];
        }
        if(topMove!=null){
            console.log(`TopMove {from:${PositionsEnum[topMove.from]},card:${CardsEnum[topMove.card]},to:${PositionsEnum[ topMove.to]}}`);
        }
        
        return true;
    }
}

TestFindMoves.execute();