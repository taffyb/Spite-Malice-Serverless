import { CardsEnum, ICardModel, IMoveModel, PositionsEnum } from 's-n-m-lib';
import { AutoMove } from '../lib/auto-move';
import { Utils } from '../lib/autoplay-utils';
import { RoboPlayer } from '../lib/find-moves';
import {cards as inArr} from '../tests/find-moves-sequence-to-game-stack';

export class TestFindMoves{
    static execute():boolean{
        const playerIdx:number=0;
        let cards:ICardModel[][]=Utils.intArr2CardArr(inArr);
        const moves:AutoMove[]= RoboPlayer.findMoves(playerIdx,cards);

        // console.log(`moves:${moves.length} \n${moves}`);
        if(moves){
            moves.forEach((m)=>{
               m.score= Utils.calculateOverallScore(m);
            });
        }
        
        moves.sort((a:AutoMove,b:AutoMove)=>{return a.score-b.score;});
        
        let topMove:AutoMove;
        let turn:IMoveModel[]=[];
        if(moves.length>0){
            topMove=Utils.getTopMove(moves);
            turn=Utils.turn(topMove);
        }
        if(turn.length>0){
            turn.forEach((m:IMoveModel,i:number)=>{
                console.log(`${"\t".repeat(i)}[${CardsEnum[m.card]}] ${m.from}=>${m.to}`);
            });
            
        }
        
        return true;
    }
}

TestFindMoves.execute();