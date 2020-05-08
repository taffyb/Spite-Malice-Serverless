import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import * as playerRoutes from './routes/players';
import * as gameRoutes from './routes/games';
import dotenv from 'dotenv';
dotenv.config();
const app = express();

const port = process.env.SVR_PORT; // default port to listen

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb', type: 'application/json'}));

// allow cross origin
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
  });

// define a route handler for the default home page
app.get( '/', ( req: any, res: any ) => {
    res.send( 'Hello world!.' );
} );

// REGISTER OUR ROUTES -------------------------------
playerRoutes.register(app);
gameRoutes.register(app);

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );
