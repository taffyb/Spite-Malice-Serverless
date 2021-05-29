"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MoveScoresEnum;
(function (MoveScoresEnum) {
    MoveScoresEnum[MoveScoresEnum["FROM_PILE"] = 1000] = "FROM_PILE";
    MoveScoresEnum[MoveScoresEnum["ADD_TO_CENTER_STACK"] = 100] = "ADD_TO_CENTER_STACK";
    MoveScoresEnum[MoveScoresEnum["OPEN_A_SPACE"] = 20] = "OPEN_A_SPACE";
    MoveScoresEnum[MoveScoresEnum["PLAY_FROM_HAND"] = 5] = "PLAY_FROM_HAND";
    MoveScoresEnum[MoveScoresEnum["PLAY_FROM_STACK"] = 4] = "PLAY_FROM_STACK";
    MoveScoresEnum[MoveScoresEnum["PLAY_JOKER"] = -2] = "PLAY_JOKER";
    MoveScoresEnum[MoveScoresEnum["DISCARD_IN_SEQUENCE"] = 13] = "DISCARD_IN_SEQUENCE";
    MoveScoresEnum[MoveScoresEnum["DISCARD_BLOCK_SELF"] = -10] = "DISCARD_BLOCK_SELF";
    MoveScoresEnum[MoveScoresEnum["DISCARD_OUT_OF_SEQUENCE"] = 0] = "DISCARD_OUT_OF_SEQUENCE";
    MoveScoresEnum[MoveScoresEnum["DISCARD_SAME_CARD"] = 5] = "DISCARD_SAME_CARD";
    MoveScoresEnum[MoveScoresEnum["DISCARD_CLOSER_TO_PILE"] = 2] = "DISCARD_CLOSER_TO_PILE";
    MoveScoresEnum[MoveScoresEnum["DISCARD_BLOCK_SEQUENCE"] = -4] = "DISCARD_BLOCK_SEQUENCE";
    MoveScoresEnum[MoveScoresEnum["DISCARD_JOKER"] = -100] = "DISCARD_JOKER";
    MoveScoresEnum[MoveScoresEnum["DISCARD_ON_JOKER"] = -200] = "DISCARD_ON_JOKER";
    MoveScoresEnum[MoveScoresEnum["REFRESH_HAND"] = 500] = "REFRESH_HAND";
})(MoveScoresEnum = exports.MoveScoresEnum || (exports.MoveScoresEnum = {}));
//# sourceMappingURL=move-enum.js.map