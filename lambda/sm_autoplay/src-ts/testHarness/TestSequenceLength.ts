import { ICardModel } from 's-n-m-lib';
import { Utils } from '../lib/autoplay-utils';
import {cards as inArr} from '../tests/sequence';

export class TestSequenceLength{
    static execute():boolean{
        let cards:ICardModel[][]=Utils.intArr2CardArr(inArr);

        for(let i=5;i<10;i++){
            console.log(`pos[${i}]:${JSON.stringify(cards[i])} ${JSON.stringify(Utils.getSequence(cards[i]))}`);
        }

        return true;
    }
}

TestSequenceLength.execute();