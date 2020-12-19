"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MoveScoresEnum;
(function (MoveScoresEnum) {
    MoveScoresEnum[MoveScoresEnum["FROM_PILE"] = 1000] = "FROM_PILE";
    MoveScoresEnum[MoveScoresEnum["ADD_TO_STACK"] = 100] = "ADD_TO_STACK";
    MoveScoresEnum[MoveScoresEnum["OPEN_A_SPACE"] = 9] = "OPEN_A_SPACE";
    MoveScoresEnum[MoveScoresEnum["PLAY_FROM_HAND"] = 5] = "PLAY_FROM_HAND";
    MoveScoresEnum[MoveScoresEnum["PLAY_FROM_STACK"] = 4] = "PLAY_FROM_STACK";
    MoveScoresEnum[MoveScoresEnum["DISCARD_IN_SEQUENCE"] = 13] = "DISCARD_IN_SEQUENCE";
    MoveScoresEnum[MoveScoresEnum["DISCARD_BLOCK_SELF"] = -10] = "DISCARD_BLOCK_SELF";
    MoveScoresEnum[MoveScoresEnum["DISCARD_OUT_OF_SEQUENCE"] = 0] = "DISCARD_OUT_OF_SEQUENCE";
    MoveScoresEnum[MoveScoresEnum["DISCARD_SAME_CARD"] = 5] = "DISCARD_SAME_CARD";
    MoveScoresEnum[MoveScoresEnum["DISCARD_BLOCK_SEQUENCE"] = -4] = "DISCARD_BLOCK_SEQUENCE";
    MoveScoresEnum[MoveScoresEnum["REFRESH_HAND"] = 50] = "REFRESH_HAND";
})(MoveScoresEnum = exports.MoveScoresEnum || (exports.MoveScoresEnum = {}));
//# sourceMappingURL=move-enum.js.map