import { utils } from "mocha";
import { CardsEnum, Dealer, Game, GameFactory, GameStatesEnum, ICardModel, IMoveModel, PositionsEnum, SMUtils } from "s-n-m-lib";
import { threadId } from "worker_threads";
import { Utils } from "../../sm_autoplay/src-ts/lib/autoplay-utils";
import { Player } from "../../sm_autoplay/src-ts/lib/player";
import {cards as inArr} from './tests/sequence';

export class GameHarness{
    dealer = new Dealer();
    deck:number[] = this.dealer.getDeck();
    players:Player[]=[];
    game:Game;
    turnId:number=1;
    cards:ICardModel[][]=Utils.intArr2CardArr(inArr);
    cardsToHand:number=0;

    constructor(playerUuids:string[]){
        playerUuids.forEach((uuid:string,i:number)=>{
            this.players.push(new Player(uuid,i));
        });
        this.game = GameFactory.gameFromInterface(GameFactory.newGame("game",playerUuids[0],playerUuids[1],this.deck));
        // this.game.cards=this.cards;
        // this.game.activePlayer=0;
    }

    play(){
        console.log(`** PLAY **`);
        //save game state
        while(![GameStatesEnum.GAME_OVER,GameStatesEnum.DRAW].includes(this.game.state)){ 
            // while(!this.game.outOfCards() && ![GameStatesEnum.GAME_OVER,GameStatesEnum.DRAW].includes(this.game.state)){ 
            console.log(`${this.players[this.game.activePlayer].uuid} TURN ${this.turnId} <${this.cardsToHand}> Remaining Cards: ${this.game.cards[PositionsEnum.DECK].length} / ${this.game.cards[PositionsEnum.RECYCLE].length} ${this.formatHand(this.game.cards,this.game.activePlayer)}`);
            
            let turn:{id:number,moves:IMoveModel[]}={id:this.turnId,moves:[]};
            let turnMoves:IMoveModel[]=[];

            //find next moves
            while((turnMoves.length==0 || (!turnMoves[turnMoves.length-1].isDiscard)) && this.game.state == GameStatesEnum.PLAYING){                
                turnMoves=this.players[this.game.activePlayer].nextTurn(this.game.cards);
                console.log(`\t---------- ${turnMoves.length}`);
                
                //apply moves
                turnMoves.forEach((m:IMoveModel)=>{
                    m.gameUuid=this.game.uuid;
                    m.playerUuid=this.players[this.game.activePlayer].uuid;
                    console.log(`\tAPPLY MOVE ${CardsEnum[SMUtils.toFaceNumber( m.card)]} ${m.from}=>${m.to} ${m.isDiscard?' DISCARD':''}`);
                    
                    Utils.applyMove(this.game.cards,m);

                    if(SMUtils.getFaceNumber(this.game.cards[m.to])==CardsEnum.KING && (m.to>=PositionsEnum.STACK_1 && m.to<=PositionsEnum.STACK_4)){
                        const recycleMoves = Utils.recycleCards(this.game,m.to);                        
                        recycleMoves.forEach((m)=>{
                           Utils.applyMove(this.game.cards,m);                           
                        });
                        console.log(`\tRECYCLE STACK ${PositionsEnum[m.to]}`);
                    }
                });
                // If the last move was a discard then my turn is over.
                if(turnMoves[turnMoves.length-1].isDiscard){
                    break;
                }
                //if winning move then break
                if(this.game.cards[PositionsEnum.PLAYER_PILE+(10*this.game.activePlayer)].length==0){
                    this.game.state=GameStatesEnum.GAME_OVER;
                }
                if(Utils.cardsInHand(this.game.cards,this.game.activePlayer)==0){  
                    let dealerMoves:IMoveModel[];                  
                    try{
                        dealerMoves= this.dealer.fillHand(this.game.activePlayer,this.game); 
                        dealerMoves.forEach((m)=>{
                            Utils.applyMove(this.game.cards,m);
                        });
                    }catch(e){
                        console.log(`REFILL HAND ${e}\n ${Utils.cardsToString(this.game.cards)}`);
                    }
                    console.log(`REFILL HAND <${this.players[this.game.activePlayer].uuid}> Remaining Cards: ${this.game.cards[PositionsEnum.DECK].length} / ${this.game.cards[PositionsEnum.RECYCLE].length}`);
                }
            }
            //save moves/game state
            if(![GameStatesEnum.GAME_OVER,GameStatesEnum.DRAW].includes(this.game.state)){

                //switch 
                this.game.switchPlayer();
                this.turnId++;
                let dealerMoves:IMoveModel[];
                try{
                    dealerMoves= this.dealer.fillHand(this.game.activePlayer,this.game);
                    dealerMoves.forEach((m)=>{
                        Utils.applyMove(this.game.cards,m);
                    });
                    this.cardsToHand= dealerMoves.length;
                }catch(e){
                    console.log(`FILL HAND ${e}`);
                }
            }
        }
        console.log(`***** ${GameStatesEnum[this.game.state]} ****** ${(this.game.state==GameStatesEnum.GAME_OVER?this.players[this.game.activePlayer].uuid+' Won':'')}`);
    }
    formatHand(cards:ICardModel[][],playerIdx:number):string{
        let out:string = "";

        for(let i=0;i<10;i++){
            out+=`[${cards[i+(10*playerIdx)].length}]`;
            // out+=`[${cards[i+(10*playerIdx)].length}<${cards[i+(10*playerIdx)].length==1?SMUtils.toFaceNumber( cards[i+(10*playerIdx)][0].cardNo):''}>]`;
        }
        return out;
    }
}


const harness = new GameHarness(["11111","22222"]);
harness.play();
console.log(`${Utils.cardsToString(harness.game.cards)}`);


