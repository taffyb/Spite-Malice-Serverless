import {DynamoDbUtils} from './dynamodb.utils';
import * as AWS from 'aws-sdk';

import {IPlayerModel, DEFAULT_PROFILE, Opponent} from 's-n-m-lib';

AWS.config.update({region: 'eu-west-2'});

const docClient = new AWS.DynamoDB.DocumentClient();
const PLAYERS_TABLE = 'sm_players';
export class PlayerAPI {

    static new(player: IPlayerModel): Promise<IPlayerModel> {
        return new Promise<IPlayerModel>((resolve, reject) => {

            const item = {
                TableName: PLAYERS_TABLE,
                Item: {
                    'created': Date.now(),
                    'uuid': player.uuid,
                    'name': player.name
                }
            };

            const exists = DynamoDbUtils.tableExists(PLAYERS_TABLE);
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
                console.error(`Table: ${PLAYERS_TABLE} Does not exist`);
            });
        });
    }

    static getPlayer(playerUuid: string, attributesToGet: string[]= null): Promise<IPlayerModel> {

        const item = {
            TableName: PLAYERS_TABLE,
            Key: {
                'uuid': playerUuid
            },
            AttributesToGet: attributesToGet
        };
        return new Promise<IPlayerModel>((resolve, reject) => {
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
            const expressionMap: any = {name: 'n', profile: 'p', status: 's', opponents: 'o'};
            const expressionAttributeNames: any = {'#t': 'updated'};
            const expressionAttributeValues: any = {':t': Date.now()};
            const item: any = {
                                TableName : PLAYERS_TABLE,
                                Key: {uuid: playerUuid}
                            };
            let updateAddExpression = 'ADD ';
            let updateSetExpression = 'SET #t=:t';
            let hasArrayCount = 0;
            console.log(`Update: ${JSON.stringify(update, null, 2)}`);
            Object.keys(update).forEach((key, i) => {
                if (!expressionMap[key]) {
                    reject(`Unknown Attribute: '${key}'`);
                }
                if (Array.isArray(update[key])) {
                    updateAddExpression += (hasArrayCount > 0 ? ',' : '') + `#${expressionMap[key]} :${expressionMap[key]}`;
                    expressionAttributeValues[`:${expressionMap[key]}`] = docClient.createSet(update[key]);
                    hasArrayCount += 1;
                } else {
                    updateSetExpression += `, #${expressionMap[key]}=:${expressionMap[key]}`;
                    expressionAttributeValues[`:${expressionMap[key]}`] = update[key];
                }
                expressionAttributeNames[`#${expressionMap[key]}`] = key;
            });
            item.ExpressionAttributeNames = expressionAttributeNames;
            item.ExpressionAttributeValues = expressionAttributeValues;
            item.UpdateExpression = updateSetExpression + (hasArrayCount > 0 ? ' ' + updateAddExpression : '');
            item.ReturnValues = 'ALL_NEW';
            console.log(`Item: ${JSON.stringify(item, null, 2)}`);

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

    static getOpponents(playerUuid: string): Promise<IPlayerModel[]> {

        const item = {
            TableName: PLAYERS_TABLE,
            Key: {
                'uuid': playerUuid
            },
            AttributesToGet: ['opponents']
        };
        return new Promise<IPlayerModel[]>((resolve, reject) => {
            docClient.get(item, (err: any, data: any) => {
                if (err) {
                    console.error(`Unable to get opponents for:${playerUuid} . Error JSON:${JSON.stringify(err, null, 2)}`);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
}
