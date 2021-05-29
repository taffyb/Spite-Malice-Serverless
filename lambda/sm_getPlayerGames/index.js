const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    const TABLE_NAME = 'sm_games';
    let playerGames=[];
    let item = {
        TableName: TABLE_NAME,
        IndexName: "player1Games",
        KeyConditionExpression: "player1Uuid = :p1",
        ExpressionAttributeValues: {":p1":event.sub},
        ExpressionAttributeNames: {"#u":"uuid", "#s":"status", "#p2":"player2Uuid"},
        ProjectionExpression: "#u, #s, #p2",
        ScanIndexForward: false
    };
    console.log(`${JSON.stringify(item)}`);
    let result = await docClient.query(item).promise();
    playerGames.push(... result.Items);
    
    item = {
        TableName: TABLE_NAME,
        IndexName: "player2Games",
        KeyConditionExpression: "player2Uuid = :p2",
        ExpressionAttributeValues: {":p2":event.sub},
        ExpressionAttributeNames: {"#u":"uuid", "#s":"status", "#p1":"player1Uuid"},
        ProjectionExpression: "#u, #s, #p1",
        ScanIndexForward: false
    };
    console.log(`${JSON.stringify(item)}`);
    result = await docClient.query(item).promise();
    playerGames.push(... result.Items);
    playerGames.forEach((game)=>{
        if(game.player1Uuid){
            game.opponent=game.player1Uuid;
            delete game.player1Uuid;
        }else{            
            game.opponent=game.player2Uuid;
            delete game.player2Uuid;
        }
    });
    callback(null,playerGames);
}