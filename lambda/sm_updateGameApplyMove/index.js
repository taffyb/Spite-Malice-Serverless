const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    const gameUuid=event.gameUuid;
    const moves=event.moves;
    console.log(`Event:${JSON.stringify(event)}`);
    
    const TABLE_NAME = 'sm_games';
    const item = {
        TableName: TABLE_NAME,
        Key: {
            'uuid': event.gameUuid
        }
    };
    const game = await docClient.get(item).promise();
    const cards= game.Item.cards;
    console.log(`Cards Before Moves:${JSON.stringify(cards)}`);
    moves.forEach((m)=>{
        cards[m.to].push(cards[m.from].pop());
    });
    console.log(`Cards After Moves:${JSON.stringify(cards)}`);
    var params = {
        TableName:"sm_games",
        Key:{
            'uuid': event.gameUuid
        },
        UpdateExpression:`set updated=:u, cards=:c`,
        ExpressionAttributeValues:{
            ":u":Date.now(),
            ":c":cards
        },
        ReturnValues:"UPDATED_NEW"
    };
    console.log(`Updating the item...\n${JSON.stringify(params)}`);
    const result = await docClient.update(params).promise();
    
    callback(null,result);
};
