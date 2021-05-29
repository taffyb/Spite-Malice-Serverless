const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    console.log(`Event: ${JSON.stringify(event)}`);
    const results=[];
    var item = {
        TableName: "sm_opponents",
        Item: {
            'created': Date.now(),
            'p1Uuid': event.sub,
            'p2Uuid': event.opponent.uuid
            ,
            'score_card':{"wins":0,"games":0,"losses":0}
        }
    };
    
    console.log(`Updating the item...with ${JSON.stringify(item)}`);    
    let result = await docClient.put(item).promise();
    results.push(result);

    item = {
        TableName: "sm_opponents",
        Item: {
            'created': Date.now(),
            'p1Uuid': event.opponent.uuid,
            'p2Uuid': event.sub,
            'score_card':{"wins":0,"games":0,"losses":0}
        }
    };
    
    console.log(`Updating the item...with ${JSON.stringify(item)}`);    
    result = await docClient.put(item).promise();
    results.push(result);
    callback();
};
