"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const autoplay_utils_1 = require("../../sm_autoplay/src-ts/lib/autoplay-utils");
const player_1 = require("../../sm_autoplay/src-ts/lib/player");
const sequence_1 = require("./tests/sequence");
class GameHarness {
    constructor(playerUuids) {
        this.dealer = new s_n_m_lib_1.Dealer();
        this.deck = this.dealer.getDeck();
        this.players = [];
        this.turnId = 1;
        this.cards = autoplay_utils_1.Utils.intArr2CardArr(sequence_1.cards);
        this.cardsToHand = 0;
        playerUuids.forEach((uuid, i) => {
            this.players.push(new player_1.Player(uuid, i));
        });
        this.game = s_n_m_lib_1.GameFactory.gameFromInterface(s_n_m_lib_1.GameFactory.newGame("game", playerUuids[0], playerUuids[1], this.deck));
        // this.game.cards=this.cards;
        // this.game.activePlayer=0;
    }
    play() {
        console.log(`** PLAY **`);
        //save game state
        while (![s_n_m_lib_1.GameStatesEnum.GAME_OVER, s_n_m_lib_1.GameStatesEnum.DRAW].includes(this.game.state)) {
            // while(!this.game.outOfCards() && ![GameStatesEnum.GAME_OVER,GameStatesEnum.DRAW].includes(this.game.state)){ 
            console.log(`${this.players[this.game.activePlayer].uuid} TURN ${this.turnId} <${this.cardsToHand}> Remaining Cards: ${this.game.cards[s_n_m_lib_1.PositionsEnum.DECK].length} / ${this.game.cards[s_n_m_lib_1.PositionsEnum.RECYCLE].length} ${this.formatHand(this.game.cards, this.game.activePlayer)}`);
            let turn = { id: this.turnId, moves: [] };
            let turnMoves = [];
            //find next moves
            while ((turnMoves.length == 0 || (!turnMoves[turnMoves.length - 1].isDiscard)) && this.game.state == s_n_m_lib_1.GameStatesEnum.PLAYING) {
                turnMoves = this.players[this.game.activePlayer].nextTurn(this.game.cards);
                console.log(`\t---------- ${turnMoves.length}`);
                //apply moves
                turnMoves.forEach((m) => {
                    m.gameUuid = this.game.uuid;
                    m.playerUuid = this.players[this.game.activePlayer].uuid;
                    console.log(`\tAPPLY MOVE ${s_n_m_lib_1.CardsEnum[s_n_m_lib_1.SMUtils.toFaceNumber(m.card)]} ${m.from}=>${m.to} ${m.isDiscard ? ' DISCARD' : ''}`);
                    autoplay_utils_1.Utils.applyMove(this.game.cards, m);
                    if (s_n_m_lib_1.SMUtils.getFaceNumber(this.game.cards[m.to]) == s_n_m_lib_1.CardsEnum.KING && (m.to >= s_n_m_lib_1.PositionsEnum.STACK_1 && m.to <= s_n_m_lib_1.PositionsEnum.STACK_4)) {
                        const recycleMoves = autoplay_utils_1.Utils.recycleCards(this.game, m.to);
                        recycleMoves.forEach((m) => {
                            autoplay_utils_1.Utils.applyMove(this.game.cards, m);
                        });
                        console.log(`\tRECYCLE STACK ${s_n_m_lib_1.PositionsEnum[m.to]}`);
                    }
                });
                // If the last move was a discard then my turn is over.
                if (turnMoves[turnMoves.length - 1].isDiscard) {
                    break;
                }
                //if winning move then break
                if (this.game.cards[s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * this.game.activePlayer)].length == 0) {
                    this.game.state = s_n_m_lib_1.GameStatesEnum.GAME_OVER;
                }
                if (autoplay_utils_1.Utils.cardsInHand(this.game.cards, this.game.activePlayer) == 0) {
                    let dealerMoves;
                    try {
                        dealerMoves = this.dealer.fillHand(this.game.activePlayer, this.game);
                        dealerMoves.forEach((m) => {
                            autoplay_utils_1.Utils.applyMove(this.game.cards, m);
                        });
                    }
                    catch (e) {
                        console.log(`REFILL HAND ${e}\n ${autoplay_utils_1.Utils.cardsToString(this.game.cards)}`);
                    }
                    console.log(`REFILL HAND <${this.players[this.game.activePlayer].uuid}> Remaining Cards: ${this.game.cards[s_n_m_lib_1.PositionsEnum.DECK].length} / ${this.game.cards[s_n_m_lib_1.PositionsEnum.RECYCLE].length}`);
                }
            }
            //save moves/game state
            if (![s_n_m_lib_1.GameStatesEnum.GAME_OVER, s_n_m_lib_1.GameStatesEnum.DRAW].includes(this.game.state)) {
                //switch 
                this.game.switchPlayer();
                this.turnId++;
                let dealerMoves;
                try {
                    dealerMoves = this.dealer.fillHand(this.game.activePlayer, this.game);
                    dealerMoves.forEach((m) => {
                        autoplay_utils_1.Utils.applyMove(this.game.cards, m);
                    });
                    this.cardsToHand = dealerMoves.length;
                }
                catch (e) {
                    console.log(`FILL HAND ${e}`);
                }
            }
        }
        console.log(`***** ${s_n_m_lib_1.GameStatesEnum[this.game.state]} ****** ${(this.game.state == s_n_m_lib_1.GameStatesEnum.GAME_OVER ? this.players[this.game.activePlayer].uuid + ' Won' : '')}`);
    }
    formatHand(cards, playerIdx) {
        let out = "";
        for (let i = 0; i < 10; i++) {
            out += `[${cards[i + (10 * playerIdx)].length}]`;
            // out+=`[${cards[i+(10*playerIdx)].length}<${cards[i+(10*playerIdx)].length==1?SMUtils.toFaceNumber( cards[i+(10*playerIdx)][0].cardNo):''}>]`;
        }
        return out;
    }
}
exports.GameHarness = GameHarness;
const harness = new GameHarness(["11111", "22222"]);
harness.play();
console.log(`${autoplay_utils_1.Utils.cardsToString(harness.game.cards)}`);
//# sourceMappingURL=game.harness.js.map