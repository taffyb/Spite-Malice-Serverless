const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    const TABLE_NAME = 'sm_players';
    const item = {
        TableName: TABLE_NAME,
        Key: {
            'uuid': event.playerUuid
        }
    };
    if(event.attributesToGet){
        item.AttributesToGet=event.attributesToGet.split(",");
    }
    docClient.get(item, function (err, data){
        if (err) {
            console.error(`Unable to get Item:${event.playerUuid} . Error JSON:${JSON.stringify(err, null, 2)}`);
            callback(err);
        } else {
            // console.log(`Result ${JSON.stringify(data,null,2)}`);
            callback(null,data.Item);
        }
    });
}