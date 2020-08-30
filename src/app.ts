import express from 'express';
// import { createServer, Server } from 'http';
import * as Io from 'socket.io';
import logger from 'morgan';
import bodyParser from 'body-parser';
import * as playerRoutes from './routes/players';
// import * as gameRoutes from './routes/games';
import {WsListener} from './classes/ws.listener';
import dotenv from 'dotenv';
import {IMoveModel} from 's-n-m-lib';

dotenv.config();
const app: any = express();
const port: string = process.env.SVR_PORT; // default port to listen
// start the Express server
const server = app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});
// set up socket.io and bind it to our server.
const io: any = require('socket.io')(server);
const wsListener = new WsListener(io);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));

// allow cross origin
app.use(function(req: any, res: any, next: any) {
    res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  });


// define a route handler for the default home page
app.get( '/', ( req: any, res: any ) => {
    res.send( 'Hello world!.' );
} );

// REGISTER OUR ROUTES -------------------------------
playerRoutes.register(app);
// gameRoutes.register(app);


