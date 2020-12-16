const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    const TABLE_NAME = 'sm_players';
    let item = {
        TableName: TABLE_NAME,
        Key: {
            'uuid': event.playerUuid
        },
        AttributesToGet:['profile']
    };

    docClient.get(item, function (err, data){
        if (err) {
            if(err.code=='ValidationException'){
                item.TableName='sm_config';
                item.Key={'config-code':'DEFAULT_PROFILE'};
                item.AttributesToGet=['value'];
                docClient.get(item, function (err, data2){
                    if (err) {
                        // console.error(`Unable to get profile for player:${event.playerUuid} . Error JSON:${JSON.stringify(err, null, 2)}`);
                        callback(err);
                    } else {
                        // console.error(`DEFAULT_PROFILE after err`);
                        callback(null,data2.Item);
                    }
                });
            }else{
                // console.error(`Unable to get profile for player:${event.playerUuid} . Error JSON:${JSON.stringify(err, null, 2)}`);
                callback(err);
            }
        } else {
            if(data.Item == null){
                item.TableName='sm_config';
                item.Key={'config-code':'DEFAULT_PROFILE'};
                item.AttributesToGet=['value'];
                // console.log(`item:${JSON.stringify(item)}`);
                docClient.get(item, function (err, data2){
                    if (err) {
                        // console.error(`Unable to get profile for player:${event.playerUuid} . Error JSON:${JSON.stringify(err, null, 2)}`);
                        callback(err);
                    } else {
                        // console.error(`DEFAULT_PROFILE after null`);
                        callback(null,data2.Item);
                    }
                });
            }else{
                //console.error(`Profile for player:${event.playerUuid}`);
                callback(null,data.Item);
            }
        }
    });
}