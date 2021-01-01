"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const autoplay_utils_1 = require("../lib/autoplay-utils");
const sequence_1 = require("../tests/sequence");
class TestSequenceLength {
    static execute() {
        let cards = autoplay_utils_1.Utils.intArr2CardArr(sequence_1.cards);
        for (let i = 6; i < 10; i++) {
            console.log(`pos[${i}]:${JSON.stringify(cards[i])} ${autoplay_utils_1.Utils.getSequence(cards, i).length},${autoplay_utils_1.Utils.getSequence(cards, i).value}`);
        }
        return true;
    }
}
exports.TestSequenceLength = TestSequenceLength;
TestSequenceLength.execute();
//# sourceMappingURL=TestSequenceLength.js.map