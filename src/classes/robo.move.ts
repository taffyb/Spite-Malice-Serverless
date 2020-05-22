import {IMoveModel, MoveTypesEnum} from 's-n-m-lib';

export enum MoveWeightsEnum {

    FROM_PILE= 1000,
    ADD_TO_STACK= 100,
    OPEN_A_SPACE= 9,
    PLAY_FROM_HAND= 5,
    PLAY_FROM_STACK= 4,
    DISCARD_IN_SEQUENCE= 13,
    DISCARD_BLOCK_SELF= -10,
    DISCARD_OUT_OF_SEQUENCE= 0,
    DISCARD_SAME_CARD= 5,
    DISCARD_BLOCK_SEQUENCE= -4,
    NEW_HAND= 50
}

export class RoboMove implements IMoveModel {
    id: number;
    gameUuid: string;
    playerUuid: string;
    from: number;
    card: number;
    to: number;
    isDiscard: boolean;
    isUndo: boolean;
    type: MoveTypesEnum;
    previousMove: RoboMove;
    nextMoves: RoboMove[];
    score: number;

}
