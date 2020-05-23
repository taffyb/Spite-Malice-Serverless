import {PlayerAPI} from './player.api';
import {IPlayerModel, Player} from 's-n-m-lib';
import * as Io from 'socket.io';

export class ActivePlayerStore {
    static activePlayerStore: ActivePlayerStore;
    static activePlayers: any = {};

    public static getInstance(): ActivePlayerStore {
        if (!this.activePlayerStore) {
            this.activePlayerStore = new ActivePlayerStore();
        }
        return this.activePlayerStore;
    }
    public static addActivePlayer(player: IPlayerModel, socket: any) {
        this.activePlayers[player.uuid] = socket;
    }
    public static removeActivePlayer(player: IPlayerModel) {
        delete this.activePlayers[player.uuid];
    }
    public static isActivePlayer(player: IPlayerModel): boolean {
        console.log(`isActivePlayer[${player.uuid}] = ${this.activePlayers[player.uuid]}`);
        return this.activePlayers[player.uuid] !== undefined;
    }
    public static getActivePlayerSocket(player: IPlayerModel): any {
        return this.activePlayers[player.uuid];
    }
}

export class WsListener {
    io: any;
    onlinePlayers: any = {};
    games: any = {};

    constructor(io: any) {
        this.io = io;

        io.on('connect', (socket: any) => {
           console.log(`Connect: ${socket.id}`);
           socket.on('message', (data: any) => {this.onMessage(data); });
           socket.on('login', (p: {player: IPlayerModel, opponents: IPlayerModel[]}) => {this.onLogin(p, socket); });
           socket.on('join', (m: {playerUuid: string, gameUuid: string}) => {this.onJoin(m); });
           socket.on('disconnect', () => {this.onDisconnect(socket); });
        });
    }
    onDisconnect(socket: any) {
        console.log(`Disconnect: ${socket.id}`);
        for (const k in ActivePlayerStore.activePlayers) {
            if (this.onlinePlayers[k] && this.onlinePlayers[k].id === socket.id) {
                const player = new Player();
                player.uuid = k;
                ActivePlayerStore.removeActivePlayer(player);
                console.log(`removed player: ${k}`);
            }
        }
    }
    onJoin(m: {playerUuid: string, gameUuid: string}) {
        console.log(`Join:${JSON.stringify(m)}`);
    }
    onMessage(message: any) {
        console.log(`[server](message): ${JSON.stringify(message)}`);
        this.io.emit('message', message);
    }
    async onLogin(p: {player: IPlayerModel}, socket: any) {
        console.log(`onLogin: ${JSON.stringify(p.player.uuid)} on ${socket.id}`);
        ActivePlayerStore.addActivePlayer(p.player, socket);

        // let the player's opponents know they are online

        const opponents$: Promise<IPlayerModel[]> = PlayerAPI.getOpponents(p.player.uuid);
        opponents$
            .then((opponents: IPlayerModel[]) => {
                opponents.forEach((opp) => {
                    if (ActivePlayerStore.isActivePlayer(opp)) {
                        const opponentSocket: any = ActivePlayerStore.getActivePlayerSocket(opp);
                        if (opponentSocket) {
                            opponentSocket.emit('player-online', p.player);
                        }
                    }
                });
            })
            .catch((err) => {console.error(err);
         });
    }
}
