import { CardsEnum, ICardModel, IMoveModel, MoveTypesEnum, PositionsEnum, SMUtils } from 's-n-m-lib';
import { MoveScoresEnum} from './move-enum';
import { AutoMove} from './auto-move';
import { Utils } from './autoplay-utils';

export interface IPlayer{
    uuid:string;
    nextTurn(cards: ICardModel[][]):IMoveModel[];
}

export class PlayerV2 implements IPlayer{
    uuid:string;
    possibleMoves:AutoMove[];
    constructor(uuid:string, private idx:number){
        this.uuid=uuid;
    }
    nextTurn(cards: ICardModel[][]): IMoveModel[] {
        const cardsN:number[][]=SMUtils.cardArr2IntArr(cards);
        this.possibleMoves=[];
        let bestMove:AutoMove;
        let turn:IMoveModel[]=[];
        bestMove= this.findBestPileMove(this.idx,cardsN);
        if(bestMove !== null){
            turn = Utils.turn(bestMove);
        }else { 
            bestMove = this.findBestNonPileMove(this.idx,cardsN);
            if(bestMove){
                turn = Utils.turn(bestMove);
            }            
        }
        return turn;
    }
    private findBestNonPileMove(playerIdx:number,cards:number[][]):AutoMove{
        let bestNonPileMove:AutoMove;
        let allPossibleNonPileMoves:AutoMove[]=[];

        this.findBestPossibleNonPileMoves(playerIdx,cards,allPossibleNonPileMoves);
        
        if(allPossibleNonPileMoves.length>0){
            allPossibleNonPileMoves.forEach((m:AutoMove)=>{
                m.score=Utils.calculateOverallScore(m);
            });
            allPossibleNonPileMoves=allPossibleNonPileMoves.sort((a:AutoMove,b:AutoMove)=>{
                return (b.score-a.score);
            });
            bestNonPileMove= allPossibleNonPileMoves[0];
        }

        return bestNonPileMove;
    }
    private findBestPossibleNonPileMoves(playerIdx:number,cards:number[][],possibelPileMoves:AutoMove[]):AutoMove[]{
        let findBestPossibleNonPileMove:AutoMove[]=[];
        let m:AutoMove;
        let gameCards:number[]=[];

        for(let gp:number=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
            let gameCard:number= SMUtils.getFaceNumberN(cards[gp]);
            let stopLooking:boolean=false;
            if(!gameCards.includes(gameCard)){ //there is no point working out all possible moves as this has already been evaluated.
                gameCards.push(gameCard);
                for(let pp=PositionsEnum.PLAYER_HAND_1+(10*playerIdx);pp<=PositionsEnum.PLAYER_STACK_4+(10*playerIdx);pp++){
                    if(stopLooking){
                        break;
                    }
                    let playerCard:number;
                    switch(pp){
                        case PositionsEnum.PLAYER_HAND_1+(10*playerIdx):
                        case PositionsEnum.PLAYER_HAND_2+(10*playerIdx):
                        case PositionsEnum.PLAYER_HAND_3+(10*playerIdx):
                        case PositionsEnum.PLAYER_HAND_4+(10*playerIdx):
                        case PositionsEnum.PLAYER_HAND_5+(10*playerIdx):
                            if(cards[pp].length>0){
                                playerCard = cards[pp][0];
                                if(SMUtils.toFaceNumber(playerCard)==CardsEnum.JOKER){
                                    m = new AutoMove();
                                    m.from = pp;
                                    m.to=gp;    
                                    m.card=playerCard;
                                    m.type=MoveTypesEnum.PLAYER;
                                    m.playerUuid=this.uuid;
                                    m.score=MoveScoresEnum.PLAY_FROM_HAND + MoveScoresEnum.PLAY_JOKER;
                                    findBestPossibleNonPileMove.push(m);
                                }else if(SMUtils.toFaceNumber(playerCard) == gameCard+1 ){
                                    m = new AutoMove();
                                    m.from = pp;
                                    m.to=gp;    
                                    m.card=playerCard;
                                    m.type=MoveTypesEnum.PLAYER;
                                    m.playerUuid=this.uuid;
                                    m.score=MoveScoresEnum.PLAY_FROM_HAND;
                                    findBestPossibleNonPileMove.push(m);
                                }
                                if(gp==PositionsEnum.STACK_1){ //there is no point in checking more than once.
                                    for(let ps:number=PositionsEnum.PLAYER_STACK_1+(10*playerIdx);ps<=PositionsEnum.PLAYER_STACK_4+(10*playerIdx);ps++){
                                        if(cards[ps].length==0){
                                            m = new AutoMove();
                                            m.from = pp;
                                            m.to=ps;    
                                            m.card=playerCard;
                                            m.type=MoveTypesEnum.PLAYER;
                                            m.playerUuid=this.uuid;
                                            m.score=MoveScoresEnum.OPEN_A_SPACE;
                                            findBestPossibleNonPileMove.push(m);
                                            break; // can only move to one open space doesn't matter which one.
                                        }
                                    }
                                }
                            }
                            break;
                        case PositionsEnum.PLAYER_STACK_1+(10*playerIdx):
                        case PositionsEnum.PLAYER_STACK_2+(10*playerIdx):
                        case PositionsEnum.PLAYER_STACK_3+(10*playerIdx):
                        case PositionsEnum.PLAYER_STACK_4+(10*playerIdx):
                            if(cards[pp].length>0){
                                playerCard = cards[pp][cards[pp].length-1];
                                if(SMUtils.toFaceNumber(playerCard)==CardsEnum.JOKER || SMUtils.toFaceNumber(playerCard) == gameCard+1 ){
                                    m = new AutoMove();
                                    m.from = pp;
                                    m.to=gp;    
                                    m.card=playerCard;
                                    m.type=MoveTypesEnum.PLAYER;
                                    m.playerUuid=this.uuid;
                                    m.score=MoveScoresEnum.PLAY_FROM_STACK;
                                    //if last card on player stack increase score
                                    if(cards[pp].length==1){
                                        m.score+=MoveScoresEnum.OPEN_A_SPACE;
                                    }
                                    findBestPossibleNonPileMove.push(m);
                                }
                            }
                            break;
                    }
                }
            }
        }
        let localCards= JSON.parse(JSON.stringify(cards));
        if(findBestPossibleNonPileMove.length>0){
            findBestPossibleNonPileMove.forEach((m:AutoMove)=>{
                Utils.applyMoveN(localCards,m);
                if(Utils.cardsInHand(localCards,playerIdx)==0){                
                    possibelPileMoves.push(m);
                }else{
                    const nextMoves = this.findBestPossibleNonPileMoves(playerIdx,localCards,possibelPileMoves);
                    if(nextMoves.length>0){
                        nextMoves.forEach((nextMove:AutoMove)=>{
                            nextMove.previousMove=m;
                            nextMove.length=m.length+1;
                            m.nextMoves.push(nextMove);
                        });
                    }else{        
                        if(Utils.cardsInHand(localCards,playerIdx)>0){
                            let discard:AutoMove =this.findBestDiscard(playerIdx,localCards);  
                            discard.previousMove=m;
                            discard.nextMoves=[];     
                            possibelPileMoves.push(discard);
                        }
                    }
                }
            });
        }else{          
            if(Utils.cardsInHand(localCards,playerIdx)>0){
                // console.log(`Discard [${this.idx}]\n${Utils.cardsNToString(localCards)}`);
                let discard:AutoMove =this.findBestDiscard(playerIdx,localCards);  
                discard.previousMove=m;
                discard.nextMoves=[];     
                possibelPileMoves.push(discard);
            }
        }
        return findBestPossibleNonPileMove;
    }
    private findBestPileMove(playerIdx:number,cards:number[][]):AutoMove{
        let bestMove:AutoMove=null;
        let allPossiblePileMoves:AutoMove[]=[];
        if(this.couldPlayPile(playerIdx,cards)){ // don't bother looking for a sequence of moves if couldn't possibly play the pile 
            let possiblePileMoves:AutoMove[]=[];
            this.findPossiblePileMoves(playerIdx,cards,allPossiblePileMoves);

            if(allPossiblePileMoves.length>0){
                //sort the moves by length - we want the shortest sequence of moves to get to the pile
                allPossiblePileMoves=allPossiblePileMoves.sort((a:AutoMove,b:AutoMove)=>{
                    return (a.length-b.length);
                });
                
                let moveLength:number=allPossiblePileMoves[0].length;
                for(let i:number=0;i<allPossiblePileMoves.length;i++){
                    let m:AutoMove = allPossiblePileMoves[i];
                    if(m.length==moveLength){
                        possiblePileMoves.push(m);
                    }else{
                        break;
                    }
                }
                // if there is move than 1 possible move to reach the pile calculate their scores and pick the best one
                if(possiblePileMoves.length>1){
                    possiblePileMoves.forEach((m:AutoMove)=>{
                        m.score=Utils.calculateOverallScore(m);
                    });
                    possiblePileMoves=possiblePileMoves.sort((a:AutoMove,b:AutoMove)=>{
                        return (b.score-a.score);
                    });
                    bestMove= possiblePileMoves[0];
                }
            }
        }
        return bestMove;
    }
    private findPossiblePileMoves(playerIdx:number,cards:number[][],possibelPileMoves:AutoMove[]):AutoMove[]{
        let findPossiblePileMoves:AutoMove[]=[];
        let m:AutoMove;
        let gameCards:number[]=[];
        let pileCard:number;

        for(let gp:number=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
            let gameCard:number= SMUtils.getFaceNumberN(cards[gp]);
            let stopLooking:boolean=false;
            if(!gameCards.includes(gameCard)){ //there is no point working out all possible moves as this has already been evaluated.
                gameCards.push(gameCard);
                for(let pp=PositionsEnum.PLAYER_PILE+(10*playerIdx);pp<=PositionsEnum.PLAYER_STACK_4+(10*playerIdx);pp++){
                    if(stopLooking){
                        break;
                    }
                    let playerCard:number;
                    switch(pp){
                        case PositionsEnum.PLAYER_PILE+(10*playerIdx):
                            if(cards[pp].length>0){
                                playerCard = cards[pp][cards[pp].length-1];
                                if(SMUtils.toFaceNumber(playerCard)==CardsEnum.JOKER){
                                    m = new AutoMove();
                                    m.from = pp;
                                    m.to=gp;    
                                    m.card=playerCard;
                                    m.type=MoveTypesEnum.PLAYER;
                                    m.playerUuid=this.uuid;
                                    m.score=MoveScoresEnum.FROM_PILE;
                                    findPossiblePileMoves.push(m);
                                }else if(SMUtils.toFaceNumber(playerCard) == gameCard+1 ){
                                    m = new AutoMove();
                                    m.from = pp;
                                    m.to=gp;    
                                    m.card=playerCard;
                                    m.type=MoveTypesEnum.PLAYER;
                                    m.playerUuid=this.uuid;
                                    m.score=MoveScoresEnum.PLAY_FROM_HAND;
                                    findPossiblePileMoves.push(m);
                                }
                            }
                            break;
                        case PositionsEnum.PLAYER_HAND_1+(10*playerIdx):
                        case PositionsEnum.PLAYER_HAND_2+(10*playerIdx):
                        case PositionsEnum.PLAYER_HAND_3+(10*playerIdx):
                        case PositionsEnum.PLAYER_HAND_4+(10*playerIdx):
                        case PositionsEnum.PLAYER_HAND_5+(10*playerIdx):
                            if(cards[pp].length>0){
                                playerCard = cards[pp][0];
                                if(SMUtils.toFaceNumber(playerCard)==CardsEnum.JOKER){
                                    m = new AutoMove();
                                    m.from = pp;
                                    m.to=gp;    
                                    m.card=playerCard;
                                    m.type=MoveTypesEnum.PLAYER;
                                    m.playerUuid=this.uuid;
                                    m.score=MoveScoresEnum.PLAY_FROM_HAND + MoveScoresEnum.PLAY_JOKER;
                                    findPossiblePileMoves.push(m);
                                }else if(SMUtils.toFaceNumber(playerCard) == gameCard+1 ){
                                    m = new AutoMove();
                                    m.from = pp;
                                    m.to=gp;    
                                    m.card=playerCard;
                                    m.type=MoveTypesEnum.PLAYER;
                                    m.playerUuid=this.uuid;
                                    m.score=MoveScoresEnum.PLAY_FROM_HAND;
                                    findPossiblePileMoves.push(m);
                                }
                            }
                            break;
                        case PositionsEnum.PLAYER_STACK_1+(10*playerIdx):
                        case PositionsEnum.PLAYER_STACK_2+(10*playerIdx):
                        case PositionsEnum.PLAYER_STACK_3+(10*playerIdx):
                        case PositionsEnum.PLAYER_STACK_4+(10*playerIdx):
                            if(cards[pp].length>0){
                                playerCard = cards[pp][cards[pp].length-1];
                                if(SMUtils.toFaceNumber(playerCard)==CardsEnum.JOKER || SMUtils.toFaceNumber(playerCard) == gameCard+1 ){
                                    m = new AutoMove();
                                    m.from = pp;
                                    m.to=gp;    
                                    m.card=playerCard;
                                    m.type=MoveTypesEnum.PLAYER;
                                    m.playerUuid=this.uuid;
                                    m.score=MoveScoresEnum.PLAY_FROM_STACK;
                                    //if last card on player stack increase score
                                    if(cards[pp].length==1){
                                        m.score+=MoveScoresEnum.OPEN_A_SPACE;
                                    }
                                    findPossiblePileMoves.push(m);
                                }
                            }
                            break;
                    }
                }
            }
        }
        findPossiblePileMoves.forEach((m:AutoMove)=>{
            if(m.from!=PositionsEnum.PLAYER_PILE+(10*playerIdx)){
                let localCards= JSON.parse(JSON.stringify(cards));
                Utils.applyMoveN(localCards,m);
                const nextMoves = this.findPossiblePileMoves(playerIdx,localCards,possibelPileMoves);
                nextMoves.forEach((nextMove:AutoMove)=>{
                    nextMove.previousMove=m;
                    nextMove.length=m.length+1;
                    m.nextMoves.push(nextMove);
                });
            }else{
                possibelPileMoves.push(m);
            }
        });

        return findPossiblePileMoves;
    }
    private findBestDiscard(playerIdx:number,cards:number[][]):AutoMove{
        const discards:AutoMove[]= this.findDiscardMoves(playerIdx,cards);
        const bestDiscard:AutoMove=Utils.getTopMove(discards);
//         console.log(`Best Move: ${Utils.moveToString(bestDiscard)}`);
        
        return bestDiscard;
    }
    private findDiscardMoves(playerIdx:number,cards:number[][]):AutoMove[]{
        let moves:AutoMove[]=[];
        let m:AutoMove;
        let pile:number[]=cards[PositionsEnum.PLAYER_PILE+(10*this.idx)];
        let pileCard:number=pile[pile.length-1];

        //find all discard options
        for(let ph=(10*playerIdx)+PositionsEnum.PLAYER_HAND_1;ph<=(10*playerIdx)+PositionsEnum.PLAYER_HAND_5;ph++){
            if(SMUtils.getTopCardN(cards[ph])!=CardsEnum.NO_CARD){
                for(let ps=(10*playerIdx)+PositionsEnum.PLAYER_STACK_1;ps<=(10*playerIdx)+PositionsEnum.PLAYER_STACK_4;ps++){
                    m=new AutoMove();
                    m.from=ph;
                    m.card=SMUtils.getTopCardN(cards[ph]);
                    m.to=ps;
                    m.score=0;
                    m.isDiscard=true;
                    moves.push(m);
                }
            }
        }

        //score each move
        moves.forEach((m)=>{
            let score:number=0;
            let diffFromTo:number=SMUtils.diffN(cards,m.from,m.to);
            let diffFromPile:number=SMUtils.diffN(cards,m.from,PositionsEnum.PLAYER_PILE+(10*playerIdx));
            let sequence = Utils.getSequenceN(cards[m.to]);

            //Avoid Moving JOKERS out of Hand
            if(SMUtils.toFaceNumber( m.card)==CardsEnum.JOKER){
                score+= MoveScoresEnum.DISCARD_JOKER;
                // and if necessary don't put them on a sequence because that defines the value.                
                if(sequence.length>0){
                    score+=(MoveScoresEnum.DISCARD_BLOCK_SEQUENCE * sequence.value);
                }
            }
            //Avoid placing any other card on top of a Joker.
            if(SMUtils.toFaceNumber(cards[m.to][cards[m.to].length-1])==CardsEnum.JOKER){
                score+=MoveScoresEnum.DISCARD_ON_JOKER;
            }
            //is it in sequence?
            if(diffFromTo<0){
                score+=(MoveScoresEnum.DISCARD_IN_SEQUENCE + (diffFromTo+1));
                if(diffFromPile==0){
                    score+=(MoveScoresEnum.DISCARD_BLOCK_SELF);
                }
            }else{ //It is going to block
                if(sequence.length>0){
                    score+=(MoveScoresEnum.DISCARD_BLOCK_SEQUENCE * (sequence.value*sequence.length)); 
                }
                score+=diffFromTo;
            }
            //Look at the GAME_STACKS
            let closestStackCard:number=SMUtils.getFaceNumberN(cards[Utils.closestStackToPile(cards,this.idx)]);
            if(pileCard>closestStackCard){
                if(m.card<pileCard && m.card>closestStackCard){
                    score+=MoveScoresEnum.DISCARD_CLOSER_TO_PILE;
                }
            }else{
                if(m.card<pileCard || m.card>closestStackCard){
                    score+=MoveScoresEnum.DISCARD_CLOSER_TO_PILE;
                }
            }
            //Look at the opponent's PILE & STACKS

            m.score=score;
        });
        
        return moves;
    }
    private couldPlayPile(playerIdx:number,cards:number[][]):boolean{
        let couldPlayPile:boolean=false;
        let distanceToPile:number[]=[];
        let flatHand:number[]=Utils.flattenHand(cards,playerIdx);
        let pp:number[]=cards[PositionsEnum.PLAYER_PILE+(playerIdx*10)];
        let pileCard:number=SMUtils.toFaceNumber(pp[pp.length-1]);

        if(pileCard===CardsEnum.JOKER){ //JOKER Can allways be played
            return true;
        }else{
            // Check each game pile
            for(let gp:number=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
                let gameStack:number[]=cards[gp];
                let gameCard:number=(gameStack.length>0?SMUtils.toFaceNumber( gameStack[gameStack.length-1]):0);

                if(pileCard==gameCard){
                    distanceToPile[gp]=13;
                }else{
                    if(pileCard>gameCard){
                        distanceToPile[gp]= pileCard-gameCard;
                    }else{
                        distanceToPile[gp]= 13-(gameCard-pileCard);
                    }
                }
            }
        }
        for(let gp:number=PositionsEnum.STACK_1;gp<=PositionsEnum.STACK_4;gp++){
            if(distanceToPile[gp]==1){ // if the distance to the pile is only 1 then can move directly
                couldPlayPile=true;
                break;
            }else{
                let gameStack:number[]=cards[gp];
                let gameCard:number=(gameStack.length>0?SMUtils.toFaceNumber( gameStack[gameStack.length-1]):0);
                let requiredCard:number;
                if((flatHand.length-1)>=distanceToPile[gp]){  //check that the hand contains enough cards to possibly reach the pile.
                    couldPlayPile=true;
                    for(let c:number=1;c<distanceToPile[gp]-1;c++){ //check that all the cards needed to reach the pile are in the players hand
                        requiredCard=gameCard+c;
                        if(gameCard+c>CardsEnum.KING){
                            requiredCard-=CardsEnum.KING;
                        }
                        if(!flatHand.includes(requiredCard)){
                            couldPlayPile = false;
                            break;
                        }
                    }
                    if(couldPlayPile){
                        break; // once we know it is possible we can stop looking
                    }
                }
            }
        }

        return couldPlayPile;
    }
}