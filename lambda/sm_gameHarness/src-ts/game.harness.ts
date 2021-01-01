import { Dealer, Game, GameFactory, GameStatesEnum, IMoveModel, PositionsEnum } from "s-n-m-lib";
import { Utils } from "../../sm_autoplay/src-ts/lib/autoplay-utils";
import { Player } from "../../sm_autoplay/src-ts/lib/player";

export class GameHarness{
    dealer = new Dealer();
    deck:number[] = this.dealer.getDeck();
    players:Player[]=[];
    game:Game;
    turnId:number=1;

    constructor(playerUuids:string[]){
        playerUuids.forEach((uuid:string,i:number)=>{
            this.players.push(new Player(uuid,i));
        });
        this.game = GameFactory.gameFromInterface(GameFactory.newGame("game",playerUuids[0],playerUuids[1],this.deck));
    }

    play(){
        console.log(`${GameStatesEnum[harness.game.state]} ${(harness.game.state==GameStatesEnum.GAME_OVER?harness.players[harness.game.activePlayer].uuid+' Won':'')}`);
        //save game state
        while(!this.game.outOfCards() && ![GameStatesEnum.GAME_OVER,GameStatesEnum.DRAW].includes(this.game.state)){ 
            console.log(`${harness.players[harness.game.activePlayer].uuid} TURN ${this.turnId}`);
            
            let turn:{id:number,moves:IMoveModel[]}={id:this.turnId,moves:[]};
            let moves:IMoveModel[]=[];

            //find next moves
            while((moves.length==0 || (!moves[moves.length-1].isDiscard)) && this.game.state == GameStatesEnum.PLAYING){
                console.log(`\t----------`);
                
                moves=this.players[this.game.activePlayer].nextMoves(this.game.cards);
                
                //apply moves
                moves.forEach(m=>{
                    m.gameUuid=this.game.uuid;
                    m.playerUuid=this.players[this.game.activePlayer].uuid;
                    console.log(`\tAPPLY MOVE ${m}`);
                    
                    Utils.applyMove(this.game.cards,m);

                });
                turn.moves.push(... moves);
                // If the last move was a discard then my turn is over.
                if(moves[moves.length-1].isDiscard){
                    break;
                }
                //if winning move then break
                if(this.game.cards[PositionsEnum.PLAYER_PILE+(10*this.game.activePlayer)].length==0){
                    this.game.state=GameStatesEnum.GAME_OVER;
                }
            }
            //save moves/game state
            if(![GameStatesEnum.GAME_OVER,GameStatesEnum.DRAW].includes(this.game.state)){

                //switch 
                this.game.switchPlayer();
                this.turnId++;
                this.dealer.fillHand(this.game.activePlayer,this.game);
            }
        }
    }
}

const harness = new GameHarness(["11111","22222"]);
harness.play();
console.log(`${GameStatesEnum[harness.game.state]} ${(harness.game.state==GameStatesEnum.GAME_OVER?harness.players[harness.game.activePlayer].uuid+' Won':'')}`);
