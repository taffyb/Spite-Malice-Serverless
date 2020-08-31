const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {

    const TABLE_NAME = 'sm_opponents';
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'p1Uuid = :p1Uuid',
            ExpressionAttributeValues: {
              ':p1Uuid': playerUuid
            },
            ProjectionExpression: 'p2Uuid, score_card'
          };
        // console.log(`params: ${JSON.stringify(params, null, 2)}`);
 
            docClient.query(params, (err, data) => {
                if (err) {
                    console.error(`Unable to get opponents for:${playerUuid} . Error JSON:${JSON.stringify(err, null, 2)}`);
                    reject(err);
                } else {
                    const opponents$= [];
                    data.Items.forEach((o) => {
                        const item = {
                            TableName: TABLE_NAME,
                            Key: {
                                'uuid': o.p2Uuid
                            },
                            AttributesToGet: ['name']
                        };
                        opponents$.push(new Promise((res, rej) => {
                            docClient.get(item, (e, d) => {
                                if (e) {
                                    console.error(`Unable to get Item:${item} . Error JSON:${JSON.stringify(e, null, 2)}`);
                                    rej(e);
                                } else {
                                    o.name = d.Item.name;
                                    res(o);
                                }
                            });
                        }));
                    });
                    Promise.all(opponents$).then((opponents) => {
                        resolve(opponents);
                    });
                }
            });

    }