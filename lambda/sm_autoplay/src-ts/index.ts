
import {Game, GameFactory, IMoveModel} from 's-n-m-lib';
import {RoboPlayer} from './lib/find-moves'

export const lambdaHandler = async ( event:any,context:any,callback:any){
    const game:Game = GameFactory.gameFromInterface(event.game);
    const moves:IMoveModel[]=[];

    moves.push(... RoboPlayer.findMoves(game.activePlayer,game.cards));
    callback(moves);
}