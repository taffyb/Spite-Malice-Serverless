import {IMoveMessage} from 's-n-m-lib';

export class MoveQueue {
    private messages: any = {};

    addMessage(message: IMoveMessage) {
        if (!this.messages[message.gameUuid]) {
            this.messages[message.gameUuid] = [];
        }
        this.messages[message.gameUuid].push(message);
    }
    getMessage(gameUuid: string): IMoveMessage {
        return null;
    }
}
