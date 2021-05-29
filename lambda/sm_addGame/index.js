const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

exports.handler = async (event, context, callback) => {
    const game = event.game;
    let err;
    if(event.sub){
        if(!(event.sub==event.game.player1Uuid || event.sub==event.game.player2Uuid)){
            err.message = "Game must involve the calling player";
        }
    }
    if(!err){
        if(!event.game.uuid){
            event.game.uuid = uuidv4();
            event.game.createDateTime=Date.now();
        }
        const item = {
            TableName: "sm_games",
            Key:game.uuid,
            Item: game
        };
        console.log(`Adding the item...\n${JSON.stringify(item)}`);
        const result = await docClient.put(item).promise();
        
        callback(null,item);
    }else{
        callback(JSON.stringify(err));
    }
};
