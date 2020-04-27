# Spite-Malice-Serverless
Local harness for developing code to be deployed to a serverless environment

## Available endpoints

POST    /games          Add a New Game(#ENDPOINT1)
GET     /games          ALL games (Not including deleted)
GET     /games/:uuid    Specific Game
PUT     /games/:uuid    Update a specific Game
DELETE  /games/:uuid    Remove a specific Game (Mark as Deleted)

###<a id="ENDPOINT1"></a>POST    /games
Saves a new Game

Body=IGameModel

if optional uuid is missing then a new Game will be instansiated and returned in the response

Response={error:{},results:IGameModel}