const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    const gameUuid=event.gameUuid;
    
    const cards= event.cards;
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

}
