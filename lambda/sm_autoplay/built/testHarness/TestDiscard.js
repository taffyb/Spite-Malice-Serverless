"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autoplay_utils_1 = require("../lib/autoplay-utils");
const find_discard_1 = require("../lib/find-discard");
const sequence_1 = require("../tests/sequence");
class TestDiscard {
    static execute() {
        let cards = autoplay_utils_1.Utils.intArr2CardArr(sequence_1.cards);
        const discards = find_discard_1.DiscardMoves.findDiscardMoves(0, cards);
        // discards.sort((a:AutoMove,b:AutoMove)=>{return a.from-b.from;});
        // discards.forEach((m)=>{
        //     console.log(`{from:${m.from},card:${m.card},to:${m.to},score:${m.score}}`);
        // });
        const topMove = autoplay_utils_1.Utils.getTopMove(discards);
        console.log(`TopMove {from:${topMove.from},card:${topMove.card},to:${topMove.to}}`);
        return true;
    }
}
exports.TestDiscard = TestDiscard;
TestDiscard.execute();
//# sourceMappingURL=TestDiscard.js.map