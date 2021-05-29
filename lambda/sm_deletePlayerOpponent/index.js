const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    console.log(`${JSON.stringify(event)}`);
    const results=[];
    var params = {
        TableName:"sm_opponents",
        Key:{
            'p1Uuid': event.sub,
            'p2Uuid':event.opponent
        }        
    };
    
    console.log(`Deleting the item...with ${JSON.stringify(params)}`);    
    let result = await docClient.delete(params).promise();
    results.push(result);

    params = {
        TableName:"sm_opponents",
        Key:{
            'p2Uuid': event.sub,
            'p1Uuid':event.opponent
        }        
    };
    
    console.log(`Deleting the item...with ${JSON.stringify(params)}`);    
    result = await docClient.delete(params).promise();
    results.push(result);
    callback(null,results);
};
