import {DynamoDbUtils} from './dynamodb.utils';
import * as AWS from 'aws-sdk';

import {IPlayerModel, DEFAULT_PROFILE, Opponent} from 's-n-m-lib';

AWS.config.update({region: 'eu-west-2'});

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'sm_players';
const EXPRESSION_MAP: any = {name: 'n', profile: 'p', status: 's', opponents: 'o'};

export class PlayerAPI {

    static new(player: IPlayerModel): Promise<IPlayerModel> {
        return new Promise<IPlayerModel>((resolve, reject) => {

            const item = {
                TableName: TABLE_NAME,
                Item: {
                    'created': Date.now(),
                    'uuid': player.uuid,
                    'name': player.name
                }
            };

            const exists = DynamoDbUtils.tableExists(TABLE_NAME);
            exists
            .then((d) => {
                docClient.put(item, (err: any, data: any) => {
                    if (err) {
                        console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
                        reject(err);
                    } else {
                        resolve(player);
                    }
                });
            })
            .catch((err) => {
                console.error(`Table: ${TABLE_NAME} Does not exist`);
            });
        });
    }

    static getPlayer(playerUuid: string, attributesToGet: string[]= null): Promise<IPlayerModel> {

        const item = {
            TableName: TABLE_NAME,
            Key: {
                'uuid': playerUuid
            },
            AttributesToGet: attributesToGet
        };
        return new Promise<IPlayerModel>((resolve, reject) => {
            console.log(`Item: ${JSON.stringify(item)}`);
            docClient.get(item, (err: any, data: any) => {
                if (err) {
                    console.error(`Unable to get Item:${playerUuid} . Error JSON:${JSON.stringify(err, null, 2)}`);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    static updatePlayer(playerUuid: string, update: any): Promise<IPlayerModel> {
        return new Promise<IPlayerModel>((resolve, reject) => {
            const expressionAttributeNames: any = {'#t': 'updated'};
            const expressionAttributeValues: any = {':t': Date.now()};
            const item: any = {
                                TableName : TABLE_NAME,
                                Key: {uuid: playerUuid}
                            };
            let updateAddExpression = 'ADD ';
            let updateSetExpression = 'SET #t=:t';
            let hasArrayCount = 0;
            console.log(`Update: ${JSON.stringify(update, null, 2)}`);
            Object.keys(update).forEach((key, i) => {
                if (!EXPRESSION_MAP[key]) {
                    reject(`Unknown Attribute: '${key}'`);
                }
                if (Array.isArray(update[key])) {
                    updateAddExpression += (hasArrayCount > 0 ? ',' : '') + `#${EXPRESSION_MAP[key]} :${EXPRESSION_MAP[key]}`;
                    expressionAttributeValues[`:${EXPRESSION_MAP[key]}`] = docClient.createSet(update[key]);
                    hasArrayCount += 1;
                } else {
                    updateSetExpression += `, #${EXPRESSION_MAP[key]}=:${EXPRESSION_MAP[key]}`;
                    expressionAttributeValues[`:${EXPRESSION_MAP[key]}`] = update[key];
                }
                expressionAttributeNames[`#${EXPRESSION_MAP[key]}`] = key;
            });
            item.ExpressionAttributeNames = expressionAttributeNames;
            item.ExpressionAttributeValues = expressionAttributeValues;
            item.UpdateExpression = updateSetExpression + (hasArrayCount > 0 ? ' ' + updateAddExpression : '');
            // item.ReturnValues = 'ALL_NEW';
            // console.log(`Item: ${JSON.stringify(item, null, 2)}`);

            docClient.update(item, (err: any, data: any) => {
                if (err) {
                    console.error(`Unable to Update:${playerUuid} . Error JSON:${JSON.stringify(err, null, 2)}`);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    static getOpponents(playerUuid: string): Promise<Opponent[]> {

        const params = {
            TableName: 'sm_opponents',
            KeyConditionExpression: 'p1Uuid = :p1Uuid',
            ExpressionAttributeValues: {
              ':p1Uuid': playerUuid
            },
            ProjectionExpression: 'p2Uuid, score_card'
          };
        // console.log(`params: ${JSON.stringify(params, null, 2)}`);
        return new Promise<Opponent[]>((resolve, reject) => {
            docClient.query(params, (err: any, data: any) => {
                if (err) {
                    console.error(`Unable to get opponents for:${playerUuid} . Error JSON:${JSON.stringify(err, null, 2)}`);
                    reject(err);
                } else {
                    const opponents$: Promise<Opponent>[] = [];
                    data.Items.forEach((o: any) => {
                        const item = {
                            TableName: TABLE_NAME,
                            Key: {
                                'uuid': o.p2Uuid
                            },
                            AttributesToGet: ['name']

                        };
                        opponents$.push(new Promise<Opponent>((res, rej) => {
                            docClient.get(item, (e: any, d: any) => {
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
        });
    }
}
