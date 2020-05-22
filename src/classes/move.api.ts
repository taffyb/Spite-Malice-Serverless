import {DynamoDbUtils} from './dynamodb.utils';
import {IMoveModel} from 's-n-m-lib';

import { DynamoDB, DynamoDBClient, DynamoDBConfiguration, PutItemInput } from '@aws-sdk/client-dynamodb-v2-node';

const config: DynamoDBConfiguration = {endpoint: 'http://localhost:8000'};
const dynamoDb = new DynamoDB(config);

export class MoveAPI {
    static addMove(move: IMoveModel): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {

            const item: any = {
              TableName: `${move.gameUuid}`,
              Item: {
                'id':           { N: `${move.id}` },
                'from':         { N: `${move.from}` },
                'card':         { N: `${move.card}` },
                'to':           { N: `${move.to}` },
                'isDiscard':    { S: `${move.isDiscard.toString()}` },
                'isUndo':       { S: `${move.isUndo.toString()}` },
                'type':         { N: `${move.type}` }
                  }
            };
            if (move.playerUuid) {
                item.Item['playerUuid'] = { S: `${move.playerUuid}` };
            }
//            console.log(`Item to add:${JSON.stringify(item)}`);
            dynamoDb.putItem(item, function(err: any, data: any) {
                if (err) {
                    console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
                    resolve(false);
                } else {
//                    console.log('Put Item . Item description JSON:', JSON.stringify(data, null, 2));
                    resolve(true);
                }
             });
        });
    }
    static getMoves(gameUuid: string, id?: number): Promise<IMoveModel[]> {
        return new Promise<IMoveModel[]>((resolve, reject) => {
            let params;
            params = {
                    TableName: `${gameUuid}`,
                    AttributesToGet: [
                      'id',
                      'playerUuid',
                      'from',
                      'card',
                      'to',
                      'isDiscard',
                      'isUndo',
                      'type'
                    ]
                  };
            if (id) {
                params = {
                    TableName: `${gameUuid}`,
                    ProjectionExpression: '#id,playerUuid,#f,card,#to,isDiscard,isUndo,#t',
                    FilterExpression: 'id>=:id',
                    ExpressionAttributeNames: {'#id': 'id', '#t': 'type', '#to': 'to', '#f': 'from'},
                    ExpressionAttributeValues: {':id': { N: `${id}`}}
                };
            } // end if
//            console.log(`Item:${JSON.stringify(params)}`);
            dynamoDb.scan(params, function(err: any, data: any) {
                if (err) {
//                    console.error('Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
//                    console.log('Query Item. Item description JSON:', JSON.stringify(data, null, 2));
                    const moves: IMoveModel[] = [];
                    data.Items.forEach((item: any) => {
                        const m: IMoveModel = {id: item.id.N,
                                          gameUuid: `${gameUuid}`,
                                          playerUuid: (item.playerUuid ? item.playerUuid.S : null),
                                          from: item.from.N,
                                          card: item.card.N,
                                          to: item.to.N,
                                          isDiscard: item.isDiscard.S,
                                          isUndo: item.isUndo.S,
                                          type: item.type.N};
                        moves.push(m);
                    });
                    moves.sort((a, b) => b.id - a.id);
                    resolve(moves);
                }
             });
        });
    }
}
