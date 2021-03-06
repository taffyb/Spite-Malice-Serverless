// import express from 'express';
// import {IGameModel, IMoveModel} from 's-n-m-lib';
// import {GameAPI} from '../classes/game.api';
// import {MoveAPI} from '../classes/move.api';

// export const register = ( app: express.Application, prefix: string= '/api' ) => {
// /*
//     POST    /games          Add a New Game
//     GET     /games          ALL games (Not including deleted)
//     GET     /games/:uuid    Specific Game
//     PUT     /games/:uuid    Update a specific Game

//     POST    /games/:uuid/moves         Add a Move
// */
//     app.get( prefix + '/games/:uuid', ( req: any, res ) => {
//         const uuid = req.params.uuid;
//         const g: Promise<IGameModel> = GameAPI.getGame(uuid);
//         g
//             .then((game: IGameModel) => {res.send(game); })
//             .catch((err) => {res.send(err); });
//     });
//     app.get( prefix + '/games', ( req: any, res ) => {
//         const limit = Number.parseInt(req.query.limit, 10);
//         const playerUuid = req.query.playerUuid;
//         const games: Promise<IGameModel[]> = GameAPI.getGames(playerUuid);
//         games
//         .then((data: IGameModel[]) => {
//             data = data.sort((a, b) => {
//                 return Number.parseInt(b.createDateTime, 10) - Number.parseInt(a.createDateTime, 10);
//             });
//             if (limit) {
//                 data = data.splice(0, limit);
//             }
//             res.send(data);
//         })
//         .catch((err) => {res.status(500).send(err); });
//     });
//     app.post( prefix + '/games', ( req: any, res ) => {
// //        console.log(`POST /games`);
//         const inGame: IGameModel = req.body;
//         const outGame: Promise<IGameModel> = GameAPI.addGame(inGame);
//         outGame
//             .then((game: IGameModel) => {res.send(game); })
//             .catch((err) => {res.send(err); });
//     });
//     app.put( prefix + '/games/:uuid', ( req: any, res ) => {
//         const nameChange: boolean = req.query.name || false;
//         const activePlayerChange: boolean = req.query.activePlayer || false;
//         const stateChange: boolean = req.query.state || false;
//         const uuid: string = req.params.uuid;
//         const game: IGameModel = req.body;
//         const out: Promise<boolean> = GameAPI.updateGame(game, nameChange, stateChange, activePlayerChange);
//         out
//             .then((success) => {res.send(success).status(200); })
//             .catch((err) => {res.send(err); });
//     });


//     app.get( prefix + '/games/:uuid/moves', ( req: any, res ) => {
//         const uuid = req.params.uuid;
//         const moves: Promise<IMoveModel[]> = MoveAPI.getMoves(uuid);
//         moves
//             .then((move: IMoveModel[]) => {res.send(move); })
//             .catch((err) => {res.send(err); });
//     });
//     app.get( prefix + '/games/:uuid/moves/:id', ( req: any, res ) => {
//         const uuid = req.params.uuid;
//         const id = req.params.id;
//         const moves: Promise<IMoveModel[]> = MoveAPI.getMoves(uuid, id);
//         moves
//             .then((move: IMoveModel[]) => {res.send(move); })
//             .catch((err) => {res.send(err); });
//     });
//     app.post( prefix + '/games/:uuid/moves', ( req: any, res ) => {
// //        console.log(`POST /games/:uuid/moves`);
//         const move: IMoveModel = req.body;
//         const result: Promise<boolean> = MoveAPI.addMove(move);
//         result
//             .then((data) => {res.sendStatus(200); })
//             .catch((err) => {res.status(500).send(err); });
//     });
// };
