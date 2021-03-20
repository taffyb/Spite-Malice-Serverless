import {CardsEnum, Move, PositionsEnum, SMUtils} from 's-n-m-lib';

export class AutoMove extends Move{
  score:number;
  nextMoves:AutoMove[]=[];
  previousMove:AutoMove;
  length:number=1;

  toString(depth:number=0):string{
    let out:string="";
       
    // console.log(`${this.nextMoves.length}`);
    
    
    out = `[${CardsEnum[ SMUtils.toFaceNumber(this.card)]}] ${this.from}=>${this.to} <${this.score}>`;
    if(this.previousMove){
        out += `\n${"\t".repeat(depth+1)}${this.previousMove.toString(depth+1)} ${this.isDiscard?' DISCARD':''}`;
    }
    return out;
  }
}