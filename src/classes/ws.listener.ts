
import * as Io from 'socket.io';

export class WsListener {
    io: any;
    players: any = {};
    games: any = {};

    constructor(io: any) {
        this.io = io;

        io.on('connect', (socket: any) => {
           console.log(`Connect: ${socket.id}`);
           socket.on('message', (data: any) => {this.onMessage(data); });
           socket.on('login', (p: {uuid: string, oponentUuids: string[]}) => {this.onLogin(p, socket); });
           socket.on('join', (m: {playerUuid: string, gameUuid: string}) => {this.onJoin(m); });
           socket.on('disconnect', () => {this.onDisconnect(socket); });
        });
    }
    onDisconnect(socket: any) {
        console.log(`Disconnect: ${socket.id}`);
        for (const k in this.players) {
            if (this.players[k].id === socket.id) {
                delete this.players[k];
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
    onLogin(player: {uuid: string, oponentUuids: string[]}, socket: any) {
        console.log(`onLogin: ${JSON.stringify(player.uuid)} on ${socket.id}`);
        this.players[player.uuid] = socket;

        // let the player's opponents know they are online

    }
}
