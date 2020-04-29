import {DynamoDbUtils} from './dynamodb.utils';
import {IGameModel, GameFactory, Dealer} from 's-n-m-lib';

import { DynamoDB, DynamoDBClient, DynamoDBConfiguration, PutItemInput } from '@aws-sdk/client-dynamodb-v2-node';

const config: DynamoDBConfiguration = {endpoint: 'http://localhost:8000'};
const dynamoDb = new DynamoDB(config);

export class GameAPI {
    static new(game: IGameModel): Promise<IGameModel> {
        return new Promise<IGameModel>((resolve, reject) => {
            let newGame: IGameModel;
            if (!game) {throw new Error('game required'); }
            if (!game.uuid) {
                const dealer = new Dealer();
                const deck: number[] = dealer.getDeck();
                newGame = GameFactory.newGame(game.name, game.player1Uuid, game.player2Uuid, deck);
            } else {
                newGame = game;
            }
            const item = {
              TableName: 'games',
              Item: {
                'created': {S: Date.now().toString()},
                'uuid': { S: `${newGame.uuid}` },
                'name': { S: `${newGame.name}` },
                'player1Uuid': { S: `${newGame.player1Uuid}` },
                'player2Uuid': { S: `${newGame.player2Uuid}` },
                'activePlayer': { N: `${newGame.activePlayer}` },
                'state': { N: `${newGame.state}` },
                'cards': { S: `${JSON.stringify(newGame.cards)}` }
                  }
            };

//            console.log(`Item: ${JSON.stringify(item.Item)}`);
//            console.log(`Check if table exists`);
            const exists = DynamoDbUtils.tableExists('games');
            exists
                .then((d) => {
                    dynamoDb.putItem(item, function(err: any, data: any) {
                        if (err) {
                            console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
                            reject(err);
                        } else {
                            console.log('Put Item . Item description JSON:', JSON.stringify(data, null, 2));
                            resolve(newGame);
                        }
                     });
                })
                .catch(async (e) => {
                    await DynamoDbUtils.createTable('games', {name: 'uuid', type: 'S'});
//                    console.log(`Put and Item in the Table`);
                    dynamoDb.putItem(item, function(err: any, data: any) {
                      if (err) {
//                          console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
                          reject(err);
                      } else {
//                          console.log('Put Item . Item description JSON:', JSON.stringify(data, null, 2));
                          resolve(newGame);
                      }
                   });
                });
           // For each Game create a separate table to hold all its moves
           // tableName = gameUuid
           // key by moveId
            DynamoDbUtils.createTable(`${newGame.uuid}`, {name: 'id', type: 'N'});
        });
    }
    static getGames(playerUuid?: string): Promise<IGameModel[]> {
        return new Promise<IGameModel[]>((resolve, reject) => {
            let params;
            params = {
                    TableName: 'games',
                    AttributesToGet: [
                      'uuid',
                      'name',
                      'player1Uuid',
                      'player2Uuid'
                    ]
                  };
            if (playerUuid) {
                params = {
                    TableName: 'games',
                    ProjectionExpression: '#id,#n,player1Uuid,player2Uuid,#s',
                    FilterExpression: 'player1Uuid=:playerUuid or player2Uuid=:playerUuid',
                    ExpressionAttributeNames: {'#n': 'name', '#id': 'uuid', '#s': 'state'},
                    ExpressionAttributeValues: {':playerUuid': { S: `${playerUuid}`}}
                };
            } // end if
            dynamoDb.scan(params, function(err: any, data: any) {
                if (err) {
//                    console.error('Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
//                    console.log('Query Game. Item description JSON:', JSON.stringify(data, null, 2));
                    const games: IGameModel[] = [];
                    data.Items.forEach((item: any) => {
                        const game: IGameModel = {uuid: item.uuid.S,
                                          name: item.name.S,
                                          player1Uuid: item.player1Uuid.S,
                                          player2Uuid: item.player2Uuid.S};
                        games.push(game);
                    });
                    resolve(games);
                }
             });
        });
    }
    static getGame(gameUuid: string): Promise<IGameModel> {
        return new Promise<IGameModel>((resolve, reject) => {
            const item = {
              TableName: 'games',
              Key: {
                'uuid': { S: `${gameUuid}` }
                  }
            };
            dynamoDb.getItem(item, function(err: any, data: any) {
                if (err) {
//                    console.error('Unable to get Item . Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
//                    console.log('Put Item . Item description JSON:', JSON.stringify(data, null, 2));
                    const cards = JSON.parse(data.Item.cards.S);
                    const game: IGameModel = {
                                                uuid: gameUuid,
                                                name: data.Item.name.S,
                                                player1Uuid: data.Item.player1Uuid.S,
                                                player2Uuid: data.Item.player2Uuid.S,
                                                activePlayer: data.Item.activePlayer.N,
                                                state: data.Item.state.N,
                                                cards: cards
                                            };
                    resolve(game);
                }
            });
        });
    }
}
