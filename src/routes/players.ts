import * as express from 'express';
import {IPlayerModel, Opponent} from 's-n-m-lib';
import {PlayerAPI} from '../classes/player.api';
import { v4 as uuid } from 'uuid';

export const register = ( app: express.Application, prefix: string= '/api' ) => {

    app.get( prefix + '/players/:uuid', ( req: any, res ) => {
        const playerUuid: string = req.params.uuid;
        const attributesToGet: string[] = Object.keys(req.query).length > 0 ? Object.keys(req.query) : null;
        PlayerAPI.getPlayer(playerUuid, attributesToGet)
        .then((player: any) => {res.send(player.Item); })
        .catch((err) => {
            res.status(404).send(
                {message: err, statusCode: 404}
            ); }
        );
    });
    app.get( prefix + '/players/:uuid/opponents', ( req: any, res ) => {
        const playerUuid: string = req.params.uuid;
        PlayerAPI.getOpponents(playerUuid)
        .then((opponents: Opponent[]) => {res.send(opponents); })
        .catch((err) => {res.send(err); });
    });
    app.get( prefix + '/players', ( req: any, res ) => {});
    app.post( prefix + '/players', ( req: any, res ) => {
        const player: IPlayerModel = req.body;

        player.uuid = uuid();

        PlayerAPI.new(player)
            .then((p: IPlayerModel) => {res.send(p); })
            .catch((err) => {res.send(err); });
    });
    app.put( prefix + '/players/:uuid', ( req: any, res ) => {
        const player: IPlayerModel = req.body;

        const playerUuid: string = req.params.uuid;

        PlayerAPI.updatePlayer(playerUuid, player)
            .then((p: IPlayerModel) => {res.send(p); })
            .catch((err) => {res.send(err); });
    });
    app.delete( prefix + '/players/:uuid', ( req: any, res ) => {});
};
