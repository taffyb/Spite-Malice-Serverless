"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autoplay_utils_1 = require("../lib/autoplay-utils");
const find_discard_1 = require("../lib/find-discard");
const sequence_1 = require("../tests/sequence");
class Test1 {
    static execute() {
        let cards = autoplay_utils_1.Utils.cardsFromArray(sequence_1.cards);
        const discards = find_discard_1.DiscardMoves.findDiscardMoves(0, cards);
        // console.log(`{cards:${JSON.stringify(cards)}`);
        discards.sort((a, b) => { return a.from - b.from; });
        discards.forEach((m) => {
            console.log(`{from:${m.from},card:${m.card},to:${m.to},score:${m.score}}`);
        });
        const topMove = autoplay_utils_1.Utils.getTopMove(discards);
        console.log(`TopMove {from:${topMove.from},card:${topMove.card},to:${topMove.to}}`);
        return true;
    }
}
exports.Test1 = Test1;
Test1.execute();
//# sourceMappingURL=test1.js.map