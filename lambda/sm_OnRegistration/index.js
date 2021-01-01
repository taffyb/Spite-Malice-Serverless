const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    const uuid = event.request.userAttributes.sub;
    const TABLE_NAME = 'sm_players';
    const item = {
        TableName: TABLE_NAME,
        Item: {
            'created': Date.now(),
            'uuid': uuid,
            'name': event.userName
        }
    };

    const newPlayer = await docClient.put(item, (err, data) => {
        if (err) {
            console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
        }else{
            console.log(`sm_OnRegisterPlayer: item:${item} data:${JSON.stringify(data)}`);
        }
    }).promise();
    callback(null,event);
};