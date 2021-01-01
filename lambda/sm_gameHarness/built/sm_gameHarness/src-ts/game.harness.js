"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const s_n_m_lib_1 = require("s-n-m-lib");
const autoplay_utils_1 = require("../../sm_autoplay/src-ts/lib/autoplay-utils");
const player_1 = require("../../sm_autoplay/src-ts/lib/player");
class GameHarness {
    constructor(playerUuids) {
        this.dealer = new s_n_m_lib_1.Dealer();
        this.deck = this.dealer.getDeck();
        this.players = [];
        this.turnId = 1;
        playerUuids.forEach((uuid, i) => {
            this.players.push(new player_1.Player(uuid, i));
        });
        this.game = s_n_m_lib_1.GameFactory.gameFromInterface(s_n_m_lib_1.GameFactory.newGame("game", playerUuids[0], playerUuids[1], this.deck));
    }
    play() {
        console.log(`${s_n_m_lib_1.GameStatesEnum[harness.game.state]} ${(harness.game.state == s_n_m_lib_1.GameStatesEnum.GAME_OVER ? harness.players[harness.game.activePlayer].uuid + ' Won' : '')}`);
        //save game state
        while (!this.game.outOfCards() && ![s_n_m_lib_1.GameStatesEnum.GAME_OVER, s_n_m_lib_1.GameStatesEnum.DRAW].includes(this.game.state)) {
            console.log(`${harness.players[harness.game.activePlayer].uuid} TURN ${this.turnId}`);
            let turn = { id: this.turnId, moves: [] };
            let moves = [];
            //find next moves
            while ((moves.length == 0 || (!moves[moves.length - 1].isDiscard)) && this.game.state == s_n_m_lib_1.GameStatesEnum.PLAYING) {
                console.log(`\t----------`);
                moves = this.players[this.game.activePlayer].nextMoves(this.game.cards);
                //apply moves
                moves.forEach(m => {
                    m.gameUuid = this.game.uuid;
                    m.playerUuid = this.players[this.game.activePlayer].uuid;
                    console.log(`\tAPPLY MOVE ${m}`);
                    autoplay_utils_1.Utils.applyMove(this.game.cards, m);
                });
                turn.moves.push(...moves);
                // If the last move was a discard then my turn is over.
                if (moves[moves.length - 1].isDiscard) {
                    break;
                }
                //if winning move then break
                if (this.game.cards[s_n_m_lib_1.PositionsEnum.PLAYER_PILE + (10 * this.game.activePlayer)].length == 0) {
                    this.game.state = s_n_m_lib_1.GameStatesEnum.GAME_OVER;
                }
            }
            //save moves/game state
            if (![s_n_m_lib_1.GameStatesEnum.GAME_OVER, s_n_m_lib_1.GameStatesEnum.DRAW].includes(this.game.state)) {
                //switch 
                this.game.switchPlayer();
                this.turnId++;
                this.dealer.fillHand(this.game.activePlayer, this.game);
            }
        }
    }
}
exports.GameHarness = GameHarness;
const harness = new GameHarness(["11111", "22222"]);
harness.play();
console.log(`${s_n_m_lib_1.GameStatesEnum[harness.game.state]} ${(harness.game.state == s_n_m_lib_1.GameStatesEnum.GAME_OVER ? harness.players[harness.game.activePlayer].uuid + ' Won' : '')}`);
//# sourceMappingURL=game.harness.js.map