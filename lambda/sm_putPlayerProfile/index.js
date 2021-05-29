const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    console.log(`${JSON.stringify(event)}`);
    var params = {
        TableName:"sm_players",
        Key:{'uuid': event.sub },
        UpdateExpression: "set profile=:p, updated=:u",
        ExpressionAttributeValues:{
            ":p":event.profile,
            ":u":Date.now()
        },
        ReturnValues:"UPDATED_NEW"
    };
    
    console.log(`Updating the item...with ${JSON.stringify(params)}`);    
    const result = await docClient.update(params).promise();
    callback(null,result);
};
