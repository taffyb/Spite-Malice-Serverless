
import { CardsEnum, Dealer, Game, GameFactory, GameStatesEnum, ICardModel, IMoveModel, MoveTypesEnum, PositionsEnum, SMUtils } from "s-n-m-lib";
import { Utils } from "../../sm_autoplayer/src-ts/lib/autoplay-utils";
import { Player,IPlayer } from "../../sm_autoplayer/src-ts/lib/player";
import { PlayerV2 } from "../../sm_autoplayerV2/src-ts/lib/player";

export class GameHarness{
    dealer = new Dealer();
    deck:number[] = this.dealer.getDeck();
    players:IPlayer[]=[];
    game:Game;

    //stats
    turns:{playerIdx:number,moves:number,duration:number}[]=[];
    turnId:number=1;
    moveId:number=0;
    cardsToHand:number=0;
    duration:{total:number,playerDuration:number[]}={total:0,playerDuration:[0,0]};
    firstPlayer:string;

    constructor(playerUuids:string[],private debug:boolean=false){
        this.players.push(new Player(playerUuids[0],0));
        this.players.push(new PlayerV2(playerUuids[1],1));
        this.game = GameFactory.gameFromInterface(GameFactory.newGame("game",playerUuids[0],playerUuids[1],this.deck));
    }
    stats():any{
        let stats;
        stats={
            gameUuid:this.game.uuid,
            firstPlayer:this.firstPlayer,
            turns:this.turns,
            duration:this.duration,
            cards:Utils.cardsToString(this.game.cards),
            winner:this.players[this.game.activePlayer].uuid
        };
        return stats;
    }

    play():GameStatesEnum{
        let message:string="";
        this.firstPlayer= this.players[this.game.activePlayer].uuid
        if(this.debug){
            message=`** PLAY: ${this.game.uuid}, First Move: ${this.firstPlayer} **\n${Utils.cardsToString(this.game.cards)}`;
            Utils.log(this.game.uuid,message);        
            console.log(message);
        }
        //save game state
        while(![GameStatesEnum.GAME_OVER,GameStatesEnum.DRAW].includes(this.game.state)){ 
            if(this.debug){
                message=`${this.players[this.game.activePlayer].uuid} TURN ${this.turnId} <${this.cardsToHand}> Remaining Cards: ${this.game.cards[PositionsEnum.DECK].length} / ${this.game.cards[PositionsEnum.RECYCLE].length} `;
                Utils.log(this.game.uuid,message); 
                console.log(message);
            }
            
            let turn:{id:number,moves:IMoveModel[]}={id:this.turnId,moves:[]};
            let turnMoves:IMoveModel[]=[];

            //find next moves
            while((turnMoves.length==0 || (!turnMoves[turnMoves.length-1].isDiscard)) && this.game.state == GameStatesEnum.PLAYING){   
                
                let startTime =Date.now();             
                turnMoves=this.players[this.game.activePlayer].nextTurn(this.game.cards);   
                this.turns.push({playerIdx:this.game.activePlayer,moves:turnMoves.length,duration:Date.now()-startTime});           
                
                if(this.debug){
                    message=`\t==> Moves:${turnMoves.length} ${this.formatHand(this.game.cards,this.game.activePlayer)} : ${Utils.cardsInPlay(this.game.cards)}`;
                    Utils.log(this.game.uuid,message);
                    console.log(message);
                }
                
                //apply moves
                turnMoves.forEach((m:IMoveModel)=>{
                    m.gameUuid=this.game.uuid;
                    m.playerUuid=this.players[this.game.activePlayer].uuid;
                    m.type=MoveTypesEnum.PLAYER;
                    m.id = this.moveId++;
                    Utils.log(this.game.uuid,JSON.stringify(m));
                    if(this.debug){
                        message=`\tAPPLY MOVE ${CardsEnum[SMUtils.toFaceNumber( m.card)]} ${m.from}=>${m.to} ${m.isDiscard?' DISCARD':''}`;
                        Utils.log(this.game.uuid,message);
                        console.log(message);
                    }
                    Utils.applyMove(this.game.cards,m);
                    if(this.game.cards[PositionsEnum.PLAYER_PILE+(10*this.game.activePlayer)].length>0){
                        if(SMUtils.getFaceNumber(this.game.cards[m.to])==CardsEnum.KING && (m.to>=PositionsEnum.STACK_1 && m.to<=PositionsEnum.STACK_4)){
                            const recycleMoves = Utils.recycleCards(this.game,m.to);                        
                            recycleMoves.forEach((m)=>{
                                m.type=MoveTypesEnum.RECYCLE;
                                m.gameUuid=this.game.uuid;
                                m.id=this.moveId++;
                                Utils.log(this.game.uuid,JSON.stringify(m));
                                Utils.applyMove(this.game.cards,m);                           
                            });
                            if(this.debug){
                                message=`\t** RECYCLE STACK ** ${PositionsEnum[m.to]}`;
                                Utils.log(this.game.uuid,message);
                                console.log(message);
                            }
                        }
                    }
                });
                if(this.debug){
                    message=`\t==> ${turnMoves.length} ${this.formatHand(this.game.cards,this.game.activePlayer)}\n`;
                    Utils.log(this.game.uuid,message);
                    console.log(message);
                }
                // If the last move was a discard then my turn is over.
                if(turnMoves.length>0 && turnMoves[turnMoves.length-1].isDiscard){
                    break;
                }
                //if winning move then break
                if(this.game.cards[PositionsEnum.PLAYER_PILE+(10*this.game.activePlayer)].length==0){
                    this.game.state=GameStatesEnum.GAME_OVER;
                    break;
                }
                if(Utils.cardsInHand(this.game.cards,this.game.activePlayer)==0){  
                    let dealerMoves:IMoveModel[];  
                    dealerMoves= this.dealer.fillHand(this.game.activePlayer,this.game); 
                    dealerMoves.forEach((m)=>{
                        if(this.game.cards[m.from].length>0){
                            m.gameUuid=this.game.uuid;
                            m.type=MoveTypesEnum.DEALER;
                            m.id=this.moveId++;
                            Utils.log(this.game.uuid,JSON.stringify(m));
                            Utils.addCard(this.game.cards,m);
                        }
                    });

                    if(this.debug){
                        message=`REFILL HAND <${this.players[this.game.activePlayer].uuid}> Remaining Cards: ${this.game.cards[PositionsEnum.DECK].length} / ${this.game.cards[PositionsEnum.RECYCLE].length}`;
                        Utils.log(this.game.uuid,message);
                        console.log(message);
                    }
                }
                this.duration.playerDuration[this.game.activePlayer]+=(Date.now()-startTime);
            }
            //save moves/game state
            if(![GameStatesEnum.GAME_OVER,GameStatesEnum.DRAW].includes(this.game.state)){

                this.game.switchPlayer();
                this.turnId++;
                let dealerMoves:IMoveModel[];
                dealerMoves= this.dealer.fillHand(this.game.activePlayer,this.game);
                dealerMoves.forEach((m)=>{
                    if(this.game.cards[m.from].length>0){
                        m.gameUuid=this.game.uuid;
                        m.type=MoveTypesEnum.DEALER;
                        m.id=this.moveId++;
                        Utils.log(this.game.uuid,JSON.stringify(m));
                        Utils.addCard(this.game.cards,m);
                    }
                });
                this.cardsToHand= dealerMoves.length;
            }
        }
        
        this.duration.total=this.duration.playerDuration[0]+this.duration.playerDuration[1];
        return this.game.state;
    }

    formatHand(cards:ICardModel[][],playerIdx:number):string{
        let out:string = "";

        for(let i=PositionsEnum.PLAYER_PILE;i<=PositionsEnum.PLAYER_STACK_4;i++){
            if(cards[i+(10*playerIdx)].length>0){
                out+=`[${SMUtils.toFaceNumber( cards[i+(10*playerIdx)][cards[i+(10*playerIdx)].length-1].cardNo)}]`;
            }else{
                out+=`[]`;
            }
        }
        out+=` `;
        for(let i=PositionsEnum.STACK_1;i<=PositionsEnum.STACK_4;i++){
            if(cards[i].length>0){
                if(SMUtils.toFaceNumber( cards[i][cards[i].length-1].cardNo)==CardsEnum.JOKER){
                    out+=`[${SMUtils.toFaceNumber( cards[i][cards[i].length-1].cardNo)}/${SMUtils.getFaceNumber(cards[i],cards[i].length-1)}]`;
                }else{
                    out+=`[${SMUtils.toFaceNumber( cards[i][cards[i].length-1].cardNo)}]`;
                }
            }else{
                out+=`[]`;
            }
        }
        return out;
    }
}

let args:string[] = process.argv.slice(2);
let csvOut:boolean=false;
let gameCount:number=0;
let games:number=1;
let cardsFilename:string;
let movesFilename:string;
let moves:IMoveModel[];
let activePlayer:number;
let undoCount:number;
let debug:boolean=false;
console.log(`${process.argv}`);


for(let i:number=0;i<args.length;i++){
    let arg:string[]=args[i].split("=");
    switch(arg[0]){
        case "CSV":
            csvOut=(arg[1]==="true");
            break;
        case "games":
            games=parseInt(arg[1]);
            break;
        case "moves":
            movesFilename=arg[1];
            break;
        case "cards":
            cardsFilename=arg[1];
            break;
        case "player":
            activePlayer=parseInt(arg[1]);
            break;
        case "undo-count":
            undoCount=parseInt(arg[1]);
            break;
        case "debug":
            debug=(arg[1]==="true");
            break;
    }
}

const MAX_HEAP_PERCENT:number = 0.75;
waitForHeap();
function waitForHeap(){
    const used = process.memoryUsage();
    // console.error(`Heap: ${used.heapUsed}/${used.heapTotal} = ${used.heapUsed/used.heapTotal}`);
    let wait = 1;
    if(gameCount<games){
        gameCount++;
        
        let harness = new GameHarness(["Player1","Player2"],debug);
        if(activePlayer !== undefined){
            harness.game.activePlayer= activePlayer;
        }
        if(cardsFilename){
            harness.game.cards=Utils.cardsFromFile(cardsFilename);
        }
        if(movesFilename){
            moves=Utils.movesFromFile(movesFilename);
            
            for(let j=0;j<undoCount;j++){
                let m:IMoveModel = moves.pop();
                Utils.undoMove(m,harness.game.cards);
            }
        }
        try{
            harness.play();
            let stats=harness.stats();
            let p1Turns = JSON.parse(JSON.stringify(stats.turns));
            let p2Turns = JSON.parse(JSON.stringify(stats.turns));
            let totalTurns=sumArr(stats.turns);
            let totalP1Turns=sumArr(p1Turns,0);
            let totalP2Turns=sumArr(p2Turns,1);
            if(csvOut){
                Utils.log('stats.csv',`[${gameCount} of ${games}],${stats.gameUuid},${stats.turns.length},${totalTurns.moves},${stats.duration.playerDuration[0]/1000},${stats.duration.playerDuration[1]/1000},${stats.firstPlayer},${stats.winner},${GameStatesEnum[harness.game.state]}`);
                Utils.log(`${harness.game.uuid}.end.txt`,`${Utils.cardsToString(harness.game.cards)}`);
            }
            console.log(`[${gameCount} of ${games}] ${stats.gameUuid}: Turns:${stats.turns.length}`+
                        ` Moves:(${totalP1Turns.moves}+${totalP2Turns.moves})=${totalTurns.moves}`+
                        ` Duration:(${stats.duration.playerDuration[0]/1000}, ${stats.duration.playerDuration[1]/1000})=${stats.duration.total/1000}`+
                        ` First Player:${stats.firstPlayer} Last Player:${stats.winner}`+
                        ` Game State: ${GameStatesEnum[harness.game.state]}`);
            
        }catch(e){
            console.log(e);
            console.error(`${Utils.cardsToString(harness.game.cards)}`);
            if((e as Error).message==="TOO MANY POSSIBLE MOVES"){
                harness=null;
                wait = 30000;
            }
        }
        setTimeout(()=>{waitForHeap()}, wait);
    }
    
}
function sumArr(arr:{playerIdx:number,moves:number,duration:number}[],playerIdx:number=-1):{moves:number,duration:number}{
    let accumulator:{moves:number,duration:number}={moves:0,duration:0};
    arr.forEach((t)=>{
        if(playerIdx!=-1){
            if(t.playerIdx==playerIdx){
                accumulator.moves += t.moves;
                accumulator.duration+=t.duration;
            }
        }else{
            accumulator.moves += t.moves;
            accumulator.duration+=t.duration;
        }
    });
    return accumulator;
}

