
import {Game, GameFactory, IMoveModel} from 's-n-m-lib';
import {PlayerV2, IPlayer} from './lib/player'

export const lambdaHandler = async ( event:any,context:any,callback:any)=>{
    const game:Game = GameFactory.gameFromInterface(event.game);
    let moves:IMoveModel[]=[];
    const playerIdx:number=0;
    const player:IPlayer = new PlayerV2("uuid",playerIdx)

    moves= player.nextTurn(game.cards);
    callback(moves);
}