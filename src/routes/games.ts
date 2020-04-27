import express from 'express';
import {IGameModel,IMoveModel} from 's-n-m-lib';

export const register = ( app: express.Application, prefix: string= '/api' ) => {
/*
    POST    /games          Add a New Game
    GET     /games          ALL games (Not including deleted)
    GET     /games/:uuid    Specific Game
    PUT     /games/:uuid    Update a specific Game
    DELETE  /games/:uuid    Remove a specific Game (Mark as Deleted)

    TODO GET     /games/:gameUuid/moves/ Retrieve all moves related to a specific Game
    TODO POST    /games/:gameUuid/moves/ Add new moves to a specific Game
*/
    app.get( prefix + '/games/:uuid', ( req: any, res ) => {});
    app.get( prefix + '/games', ( req: any, res ) => {});
    app.post( prefix + '/games', ( req: any, res ) => {});
    app.put( prefix + '/games/:uuid', ( req: any, res ) => {});
    app.delete( prefix + '/games/:uuid', ( req: any, res ) => {});


    app.get( prefix + '/games/:uuid/moves', ( req: any, res ) => {});
    app.post( prefix + '/games/:uuid/moves', ( req: any, res ) => {});
};
