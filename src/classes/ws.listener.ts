import {PlayerAPI} from './player.api';
import {IPlayerModel, Player, IInvitationModel} from 's-n-m-lib';
import * as Io from 'socket.io';
import { v4 as uuid } from 'uuid';

export class ActivePlayerStore {
    static activePlayerStore: ActivePlayerStore;
    static activePlayers: any = {};

    public static getInstance(): ActivePlayerStore {
        if (!this.activePlayerStore) {
            this.activePlayerStore = new ActivePlayerStore();
        }
        return this.activePlayerStore;
    }
    static addOpponents(player: IPlayerModel, opponents: IPlayerModel[]) {
        this.activePlayers[player.uuid].opponents = opponents;
    }
    static getActivePlayerOpponents(player: IPlayerModel): IPlayerModel[] {
            return this.activePlayers[player.uuid].opponents;
    }
    public static addActivePlayer(player: IPlayerModel, socket: any) {
        this.activePlayers[player.uuid] = {socket: socket};
    }
    public static removeActivePlayer(player: IPlayerModel) {
        delete this.activePlayers[player.uuid];
    }
    public static isActivePlayer(player: IPlayerModel): boolean {
        return this.activePlayers[player.uuid] !== undefined;
    }
    public static getActivePlayerSocket(player: IPlayerModel): any {
        return this.activePlayers[player.uuid].socket;
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
           socket.on('invite', (invite: IInvitationModel) => {this.onInvite(invite); });
           socket.on('invite-response', (invite: IInvitationModel) => {this.onInviteResponse(invite); });
           socket.on('join', (join: {player2: IPlayerModel, gameUuid: string}) => {this.onJoin(join); });
           socket.on('disconnect', () => {this.onDisconnect(socket); });
        });
    }
    onDisconnect(socket: any) {
//        when a player disconnects
//        find all of their opponents and notify them of the disconnection
//        then remove the player from the Active Store
        console.log(`Disconnect: ${socket.id}`);
        for (const k in ActivePlayerStore.activePlayers) {
            if (k.length > 0) {
                const player = new Player();
                player.uuid = k;
                if (ActivePlayerStore.isActivePlayer(player) && ActivePlayerStore.getActivePlayerSocket(player).id === socket.id) {
                    const opponents: IPlayerModel[] = ActivePlayerStore.getActivePlayerOpponents(player);
                    console.log(`${player.uuid} has opponents: ${JSON.stringify(opponents)}`);
                    opponents.forEach((opp) => {
                        if (ActivePlayerStore.isActivePlayer(opp)) {
                            const opponentSocket = ActivePlayerStore.getActivePlayerSocket(opp);
                            console.log(`Notify ${opp.name} that ${player.uuid} has disconnected`);
                            opponentSocket.emit('disconnected', player);
                        }
                    });
                    ActivePlayerStore.removeActivePlayer(player);
                    console.log(`removed player: ${k}`);
                }
            }
        }
    }
    onJoin(join: {player2: IPlayerModel, gameUuid: string}) {
        console.log(`onJoin: ${JSON.stringify(join)}`);
        if (ActivePlayerStore.isActivePlayer(join.player2)) {
            const opponentSocket: any = ActivePlayerStore.getActivePlayerSocket(join.player2);
            opponentSocket.emit('join', join.gameUuid);
        }
    }
    onInviteResponse(invite: IInvitationModel) {
        console.log(`onInviteResponse: ${JSON.stringify(invite)}`);
        invite.uuid = uuid();
        if (ActivePlayerStore.isActivePlayer(invite.from)) {
            const opponentSocket: any = ActivePlayerStore.getActivePlayerSocket(invite.from);
            opponentSocket.emit('invitation-response', invite);
        }
    }
    onInvite(invite: IInvitationModel) {
        console.log(`onInvite: ${JSON.stringify(invite)}`);
        invite.uuid = uuid();
        const opponentSocket: any = ActivePlayerStore.getActivePlayerSocket(invite.to);
        opponentSocket.emit('invitation', invite);
    }
    onMessage(message: any) {
        console.log(`[server](message): ${JSON.stringify(message)}`);
        this.io.emit('message', message);
    }
    async onLogin(p: {player: IPlayerModel}, socket: any) {
        console.log(`onLogin: ${JSON.stringify(p.player)} on ${socket.id}`);
        ActivePlayerStore.addActivePlayer(p.player, socket);

        // let the player's opponents know they are now online
        const opponents$: Promise<IPlayerModel[]> = PlayerAPI.getOpponents(p.player.uuid);
        opponents$
            .then((opponents: IPlayerModel[]) => {
                ActivePlayerStore.addOpponents(p.player, opponents);
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
