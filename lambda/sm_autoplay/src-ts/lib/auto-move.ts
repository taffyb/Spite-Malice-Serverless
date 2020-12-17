import {Move} from 's-n-m-lib';

export class AutoMove extends Move{
    score:number;
    nextMoves:AutoMove[];
    previousMove:AutoMove;
  }