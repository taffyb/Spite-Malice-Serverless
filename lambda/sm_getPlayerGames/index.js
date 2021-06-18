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
        ExpressionAttributeNames: {"#u":"uuid", "#s":"state", "#p1":"player1Uuid", "#p2":"player2Uuid", "#n":"name","#c":"createDateTime","#a":"activePlayer"},
        ProjectionExpression: "#u, #s, #p1, #p2, #n, #c, #a",
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
        ExpressionAttributeNames: {"#u":"uuid", "#s":"state", "#p1":"player1Uuid", "#p2":"player2Uuid", "#n":"name","#c":"createDateTime","#a":"activePlayer"},
        ProjectionExpression: "#u, #s, #p1, #p2, #n, #c, #a",
        ScanIndexForward: false
    };
    console.log(`${JSON.stringify(item)}`);
    result = await docClient.query(item).promise();
    playerGames.push(... result.Items);
    
    callback(null,playerGames);
}