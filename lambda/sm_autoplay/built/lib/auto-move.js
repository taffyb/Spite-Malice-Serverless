"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
class AutoMove extends s_n_m_lib_1.Move {
    constructor() {
        super(...arguments);
        this.nextMoves = [];
    }
    toString(depth = 0) {
        let out = "";
        // console.log(`${this.nextMoves.length}`);
        out = `[${s_n_m_lib_1.CardsEnum[s_n_m_lib_1.SMUtils.toFaceNumber(this.card)]}] ${this.from}=>${this.to} <${this.score}>`;
        if (this.previousMove) {
            out += `\n${"\t".repeat(depth + 1)}${this.previousMove.toString(depth + 1)} `;
        }
        return out;
    }
}
exports.AutoMove = AutoMove;
//# sourceMappingURL=auto-move.js.map