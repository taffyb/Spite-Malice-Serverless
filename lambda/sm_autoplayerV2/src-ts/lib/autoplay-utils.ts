import { string0To255 } from 'aws-sdk/clients/customerprofiles';
import { Number } from 'aws-sdk/clients/iot';
import { appendFileSync, readFileSync } from 'fs';
import {  Card,   ICardModel, IGameModel, IMoveModel, Move, MoveTypesEnum, PositionsEnum, SMUtils } from "s-n-m-lib";
import { AutoMove } from "./auto-move";

export class Utils{
    
    static calculateOverallScore(finalMove:AutoMove):number{
        let move:AutoMove=finalMove;
        let score:number=move.score;
        let i:number=0;
        
        while(move.previousMove){
            score+=finalMove.previousMove.score;
            move=move.previousMove;
            i++;
        }
        return score;        
    }
    static allPossibleMoves(moves:AutoMove[]):AutoMove[]{
        let possibleMoves:AutoMove[]=[];

        
        if(moves){
            moves.forEach((m)=>{
                // console.log(`moves:${moves.length} next:${m.nextMoves?m.nextMoves.length:0}`);
                if(m.nextMoves.length>0){
                    possibleMoves = possibleMoves.concat(Utils.allPossibleMoves(m.nextMoves));
                    // console.log(`Next Moves - possibleMoves:${possibleMoves.length}`);
                }else{
                    possibleMoves.push(m);
                    // console.log(`possibleMoves:${possibleMoves.length}`);
                }
            });
        }
        return possibleMoves;
    }
    static turn(move:AutoMove):IMoveModel[]{
        let autoMove:AutoMove = move;
        let m:IMoveModel;
        let turn:IMoveModel[]=[];
        
 //       console.log(`Move=>Turn ${autoMove}`);
        
        //build an array of moves
        m = new Move();
        m.from= autoMove.from;
        m.to= autoMove.to;
        m.card= autoMove.card;
        m.isDiscard= autoMove.isDiscard;
        turn.push(m);
        while(autoMove.previousMove){
            m = new Move();
            m.from= autoMove.previousMove.from;
            m.to= autoMove.previousMove.to;
            m.card= autoMove.previousMove.card;
            m.isDiscard= autoMove.previousMove.isDiscard;
            turn.push(m);
            autoMove=autoMove.previousMove;
        }
        turn = turn.reverse();
        
 //       console.log(`Move=>Turn ${JSON.stringify(turn,null, 2)}`);
        return turn;
    }
    static freePlayerStacks(cards:ICardModel[][],playerIdx:number):number{
        let freePlayerStacks:number=0;
        for (let i =0;i<4;i++){
            if(cards[PositionsEnum.PLAYER_STACK_1+i+(10*playerIdx)].length==0){
                freePlayerStacks+=1;
            }
        }

        return freePlayerStacks;
    }
    static applyMove(cards:ICardModel[][],move:IMoveModel):ICardModel[][]{
        
        let c:ICardModel = cards[move.from].pop();
        cards[move.to].push(c);
        return cards;
    }
    static applyMoveN(cards:number[][],move:IMoveModel):number[][]{
        
        let c:number = cards[move.from].pop();
        cards[move.to].push(c);
        return cards;
    }
    static cardsInHand(cards:ICardModel[][],playerIdx:number):number{
        let cardsInHand=5;
        for(let h=0;h<5;h++){
            if(cards[PositionsEnum.PLAYER_HAND_1+(playerIdx*10)+h].length==0){
                cardsInHand -=1;
            }
        }
        return cardsInHand;
    }
    static cardsInHandN(cards:number[][],playerIdx:number):number{
        let cardsInHand=5;
        for(let h=0;h<5;h++){
            if(cards[PositionsEnum.PLAYER_HAND_1+(playerIdx*10)+h].length==0){
                cardsInHand -=1;
            }
        }
        return cardsInHand;
    }
    static intArr2CardArr(inArr:number[][]):ICardModel[][]{
        
        const cards:ICardModel[][]=[];

        for(let pos:number=PositionsEnum.PLAYER_PILE;pos<=PositionsEnum.RECYCLE;pos++){
            cards.push([]);
            for(let c:number=0;c<inArr[pos].length;c++){
                cards[pos].push(new Card(inArr[pos][c],pos));
            }
        }
        return cards;
    }
    /**
     * getSequence
     * 
     * @param cards - array of cards
     * @returns {length:number,value:number}
     * length is the number of cards in a ascending order eg. [13,12,10] = 4
     * value is an indication of how sparce the sequence is [13,12,11,10] =1 ; [13,12,10]=.75 (3/4)
    */
    static getSequence(cards:ICardModel[]):{length:number,value:number}{
        let sequenceLength:number=1;
        let sequenceValue:number=0;

        if(cards.length>1){
            const end=SMUtils.toFaceNumber(cards[cards.length-1].cardNo);
            let lastCard:number = end;
            for(let i=cards.length-2;i>=0;i--){
                let nextCard = SMUtils.toFaceNumber(cards[i].cardNo)
                if(nextCard>lastCard){
                    sequenceLength++;
                    lastCard=nextCard;
                }else{
                    break;
                }
            }
            sequenceValue=((sequenceLength)/(lastCard-end+1));
        }
        // console.log(`{${sequenceLength},${sequenceValue}}`);
        return {length:sequenceLength,value:(Number.isNaN(sequenceValue)?0:sequenceValue)};
    }
    /**
     * getSequenceN
     * 
     * @param cards - array of cards
     * @returns {length:number,value:number}
     * length is the number of cards in a ascending order eg. [13,12,10] = 4
     * value is an indication of how sparce the sequence is [13,12,11,10] =1 ; [13,12,10]=.75 (3/4)
    */
    static getSequenceN(cards:Number[]):{length:number,value:number}{
        let sequenceLength:number=1;
        let sequenceValue:number=0;

        if(cards.length>1){
            const end=SMUtils.toFaceNumber(cards[cards.length-1]);
            let lastCard:number = end;
            for(let i=cards.length-2;i>=0;i--){
                let nextCard = SMUtils.toFaceNumber(cards[i])
                if(nextCard>lastCard){
                    sequenceLength++;
                    lastCard=nextCard;
                }else{
                    break;
                }
            }
            sequenceValue=((sequenceLength)/(lastCard-end+1));
        }
        // console.log(`{${sequenceLength},${sequenceValue}}`);
        return {length:sequenceLength,value:(Number.isNaN(sequenceValue)?0:sequenceValue)};
    }
    static getTopMove(moves:AutoMove[]):AutoMove{
        let topMoves:AutoMove[]=[];
        let topMoveIdx:number=1;

        if(moves.length==0){
            console.trace;
            throw new Error("NO MOVES");
        }else if(moves.length>1){
            //sort moves by score (DEC)
            moves.sort((a:AutoMove,b:AutoMove)=>{return b.score-a.score});
            let topScore = moves[0].score
            //collect all moves with the highest score
            for( let i=0;i<moves.length;i++){
                let m:AutoMove = moves[i];
                if(m.score==topScore){
 //                   console.log(`Possible TopMove\n${m}`);
                    
                    topMoves.push(m);
                }else{
                    break;
                }
            }
            // random pick of the top moves
            if(topMoves.length>1){
                topMoveIdx = Math.floor( Math.random()*(topMoves.length))+1;
            }
        }
        
        return topMoves[topMoveIdx-1];
    }
    static cardsToString(cards:ICardModel[][]):string{
        let out:string="";

        cards.forEach((pos:ICardModel[],posIdx:number)=>{
           
            out+=`[`;
            pos.forEach((c:ICardModel,cIdx:number)=>{
                out+=SMUtils.toFaceNumber( c.cardNo);
                if(cIdx!=pos.length-1){
                    out+=",";
                }
            });
            out+="]";
            if(posIdx!=cards.length-1){
                out+=",";
            }
            out+="\n";
        });
        return out;
    }    
    static recycleCards(game: IGameModel, position: number):IMoveModel[]{
        const moves:IMoveModel[]=[];
        for(let i = game.cards[position].length-1; i>=0; i--){
            let c = game.cards[position][i];
            let m = new Move();
            m.card = c.cardNo;
            m.from = position;
            m.to = PositionsEnum.RECYCLE;
            m.type = MoveTypesEnum.RECYCLE;
            moves.push(m);
        }
        return moves;
    }
    static cardsInPlay(cards:ICardModel[][]):number{
        let cardsInPlay=0;
        cards.forEach((m:ICardModel[])=>{
            cardsInPlay+=m.length;
        });
        return cardsInPlay;
    }
    static log(filename:string,s:string){
        
        const file= appendFileSync(`./output/${filename}.txt`, s+'\n');
    }
    static addCard(cards:ICardModel[][],m:IMoveModel){
        let c= new Card(m.card,m.to);
        cards[m.to].push(c);

    }
    static cardsFromFile(filename:string):ICardModel[][]{
        let cards:ICardModel[][]=[];
        let cardsTemp:number[][]=[];
        let file:string=readFileSync(filename).toString();
        cardsTemp = JSON.parse(file);

        cardsTemp.forEach((pos:number[],i:number)=>{
            cards.push([]);
            pos.forEach((c:number)=>{
                cards[i].push(new Card(c,i));
            });
        });
        return cards;
    }
    static movesFromFile(filename:string):IMoveModel[]{
        let moves:IMoveModel[]=[];
        let file:string=readFileSync(filename).toString();
        moves = JSON.parse(file);
        return moves;
    }
    static undoMove(m:IMoveModel, cards:Card[][]){
        let card:ICardModel = cards[m.to].pop();
        cards[m.from].push(card);
    }
    /**
     * @description Converts an ICardModel structure a simple Number array structure
     * @param cards ICardModel[][]
     * @returns number[][]
     */
    static cards2cardsN(cards:ICardModel[][]):number[][]{
        const cardsN:number[][]=[];
        cards.forEach((pos:ICardModel[], i)=>{
            cardsN.push([]);
            pos.forEach((c)=>{
                cardsN[i].push(c.cardNo);
            });
        });

        return cardsN;
    }
}