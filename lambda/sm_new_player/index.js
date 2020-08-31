const { v4: uuid } = require('uuid');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    const TABLE_NAME = 'sm_players';
    const item = {
        TableName: TABLE_NAME,
        Item: {
            'created': Date.now(),
            'uuid': uuid(),
            'name': event.name
        }
    };

    docClient.put(item, (err, data) => {
        if (err) {
            console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            callback(null,item.Item);
        }
    });
}