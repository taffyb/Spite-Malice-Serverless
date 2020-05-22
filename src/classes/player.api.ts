import {DynamoDbUtils} from './dynamodb.utils';
import {Attribute, AttributeTypesEnum} from './dynamodb.types';
import {IPlayerModel, DEFAULT_PROFILE} from 's-n-m-lib';

import { DynamoDB, DynamoDBClient, DynamoDBConfiguration } from '@aws-sdk/client-dynamodb-v2-node';
import {PutItemInput, ScanInput} from '@aws-sdk/client-dynamodb-v2-node';

const config: DynamoDBConfiguration = {endpoint: 'http://localhost:8000'};
const dynamoDb = new DynamoDB(config);

export class PlayerAPI {

    static new(player: IPlayerModel): Promise<IPlayerModel> {
        return new Promise<IPlayerModel>((resolve, reject) => {

            const item = {
              TableName: 'players',
              Item: {
                    'created': {S: Date.now().toString()},
                    'uuid': { S: `${player.uuid}` },
                    'name': { S: `${player.name}` },
                    'profile': { S: `${JSON.stringify(DEFAULT_PROFILE)}` },
                    'opponents': { S: `[]` }
                  }
            };

            const exists = DynamoDbUtils.tableExists('players');
            exists
                .then((d) => {
                    dynamoDb.putItem(item, function(err: any, data: any) {
                        if (err) {
                            console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
                            reject(err);
                        } else {
                            resolve(player);
                        }
                     });
                })
                .catch(async (e) => {
                    const keys: Attribute[] = [{name: 'uuid', type: AttributeTypesEnum.STRING}];
                    await DynamoDbUtils.createTable('player', keys);
                    dynamoDb.putItem(item, function(err: any, data: any) {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(player);
                      }
                   });
                });
        });
    }

    static getOpponents(playerUuid: string): Promise<IPlayerModel[]> {
        const opponents: any = {'123456': [{uuid: '987654', name: 'Suzannah'}, {uuid: '111111', name: 'Player1'},
                                    {uuid: '222222', name: 'Player2'}],
                            '987654': [{uuid: '123456', name: 'Taffy'}, {uuid: '111111', name: 'Player1'}]
        };


        return new Promise<IPlayerModel[]>((resolve, reject) => {
            const myOpponents: IPlayerModel[] = [];
            if (opponents[playerUuid]) {
                myOpponents.push(... opponents[playerUuid]);
            }
            myOpponents.push({uuid: '007', name: 'Robo'});
            resolve(myOpponents);
        });
    }
}
