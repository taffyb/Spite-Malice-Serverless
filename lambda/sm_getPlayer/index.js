const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    const TABLE_NAME = 'sm_games';
    const item = {
        TableName: TABLE_NAME,
        Key: {
            'uuid': event.gameUuid
        }
    };
    docClient.get(item, function (err, data){
        if (err) {
            console.error(`Unable to get Item:${event.sub} . Error JSON:${JSON.stringify(err, null, 2)}`);
            callback(err);
        } else {
            // console.log(`Result ${JSON.stringify(data,null,2)}`);
            callback(null,data.Item);
        }
    });
}