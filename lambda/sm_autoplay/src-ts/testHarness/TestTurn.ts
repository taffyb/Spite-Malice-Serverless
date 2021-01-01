import { ICardModel, IMoveModel } from 's-n-m-lib';
import { AutoMove } from '../lib/auto-move';
import { Utils } from '../lib/autoplay-utils';
import { DiscardMoves } from '../lib/find-discard';
import {cards as inArr} from '../tests/sequence';

export class TestTurn{
    static execute():boolean{
        let cards:ICardModel[][]=Utils.intArr2CardArr(inArr);
        const discards:AutoMove[]= DiscardMoves.findDiscardMoves(0,cards);

        // console.log(`{cards:${JSON.stringify(cards)}`);
        discards.sort((a:AutoMove,b:AutoMove)=>{return a.from-b.from;});
        discards.forEach((m)=>{
            console.log(`{from:${m.from},card:${m.card},to:${m.to},score:${m.score}}`);
        });
        const topMove:IMoveModel=Utils.getTopMove(discards);
        console.log(`TopMove {from:${topMove.from},card:${topMove.card},to:${topMove.to}}`);
        return true;
    }
}

TestTurn.execute();