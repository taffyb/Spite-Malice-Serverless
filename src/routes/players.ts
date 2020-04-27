import * as express from 'express';
import {IPlayerModel} from 's-n-m-lib';
import { v4 as uuid } from 'uuid';

export const register = ( app: express.Application, prefix: string= '/api' ) => {

    app.get( prefix + '/players/:uuid', ( req: any, res ) => {});
    app.get( prefix + '/players', ( req: any, res ) => {});
    app.post( prefix + '/players', ( req: any, res ) => {});
    app.put( prefix + '/players/:uuid', ( req: any, res ) => {});
    app.delete( prefix + '/players/:uuid', ( req: any, res ) => {});
};
