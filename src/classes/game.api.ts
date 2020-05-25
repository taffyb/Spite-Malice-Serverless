import {DynamoDbUtils} from './dynamodb.utils';
import {Attribute, AttributeTypesEnum} from './dynamodb.types';
import {IGameModel, GameFactory, Game, Dealer, GameStatesEnum} from 's-n-m-lib';

import { DynamoDB, DynamoDBClient, DynamoDBConfiguration } from '@aws-sdk/client-dynamodb-v2-node';
import {PutItemInput, ScanInput} from '@aws-sdk/client-dynamodb-v2-node';

const config: DynamoDBConfiguration = {endpoint: 'http://localhost:8000'};
const dynamoDb = new DynamoDB(config);

export class GameAPI {
    static addGame(game: IGameModel): Promise<IGameModel> {
        return new Promise<IGameModel>((resolve, reject) => {
            let newGame: IGameModel;
            if (!game) {throw new Error('game required'); }
            if (!game.uuid) {
                const dealer = new Dealer();
                const deck: number[] = dealer.getDeck();
                newGame = GameFactory.newGame(game.name, game.player1Uuid, game.player2Uuid, deck, game.local);
            } else {
                newGame = game;
            }
            const item = {
              TableName: 'games',
              Item: {
                'created': {S: Date.now().toString()},
                'local': { S: `${newGame.local}` },
                'uuid': { S: `${newGame.uuid}` },
                'name': { S: `${newGame.name}` },
                'player1Uuid': { S: `${newGame.player1Uuid}` },
                'player2Uuid': { S: `${newGame.player2Uuid}` },
                'activePlayer': { N: `${newGame.activePlayer}` },
                'state': { N: `${newGame.state}` },
                'cards': { S: `${JSON.stringify(newGame.cards)}` },
                'createDateTime': { S: `${newGame.createDateTime}` },
                'updateDateTime': { S: `${newGame.createDateTime}` }
                  }
            };

            const exists = DynamoDbUtils.tableExists('games');
            exists
                .then((d) => {
                    dynamoDb.putItem(item, function(err: any, data: any) {
                        if (err) {
                            console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
                            reject(err);
                        } else {
                            resolve(newGame);
                        }
                     });
                })
                .catch(async (e) => {
                    const gameKeys: Attribute[] = [{name: 'uuid', type: AttributeTypesEnum.STRING}];
                    await DynamoDbUtils.createTable('games', gameKeys);
                    dynamoDb.putItem(item, function(err: any, data: any) {
                      if (err) {
                          reject(err);
                      } else {
                          resolve(newGame);
                      }
                   });
                });

           // For each Game create a separate table to hold all its moves
           // tableName = gameUuid
           // key by moveId
            const moveKeys: Attribute[] = [{name: 'id', type: AttributeTypesEnum.NUMERIC}];
            DynamoDbUtils.createTable(`${newGame.uuid}`, moveKeys);
        });
    }
    static updateGame(game: IGameModel, nameChange: boolean, stateChange: boolean, activePlayerChange: boolean): Promise<boolean> {
        const expValues: any = {};
        const expNames: any = {};
        let updateExp = 'SET #c= :c, #udt=:udt';
        expValues[':c'] = {'S': `${JSON.stringify(game.cards)}`};
        expValues[':udt'] = {'S': `${game.updateDateTime}`};
        expNames['#c'] = 'cards';
        expNames['#udt'] = 'updateDateTime';
        if (nameChange) {
            expValues[':n'] = {'S': `${game.name}`};
            expNames['#n'] = 'name';
            updateExp += ', #n= :n';
        }
        if (stateChange) {
            expValues[':s'] = {'N': `${game.state}`};
            expNames['#s'] = 'state';
            updateExp += ', #s= :s';
        }
        if (activePlayerChange) {
            updateExp += `, #a=:a`;
            expValues[':a'] = {'N': `${game.activePlayer}`};
            expNames['#a'] = 'activePlayer';
        }
        const item = {
            TableName: 'games',
            Key: {uuid: {'S': `${game.uuid}`}},
            UpdateExpression: updateExp,
            ExpressionAttributeValues: expValues,
            ExpressionAttributeNames: expNames
        };
        return new Promise<boolean>((resolve, reject) => {
          dynamoDb.updateItem(item)
              .then((data) => {
                  resolve(true);
              })
              .catch((err) => {
                  console.error('Unable to update Item . Error JSON:', JSON.stringify(err, null, 2));
                  reject(err);
              });
      });
    }
    static getGames(playerUuid?: string): Promise<IGameModel[]> {
        return new Promise<IGameModel[]>((resolve, reject) => {
            let params: ScanInput;
            params = {
                    TableName: 'games',
                    ProjectionExpression: '#id,#n,player1Uuid,player2Uuid,#s,createDateTime,#l,#a',
                    ExpressionAttributeNames: {'#n': 'name', '#id': 'uuid', '#s': 'state', '#l': 'local',
                                               '#a': 'activePlayer'}
                  };
            if (playerUuid) {
                params.FilterExpression = 'player1Uuid=:playerUuid or player2Uuid=:playerUuid',
                params.ExpressionAttributeValues = {':playerUuid': { S: `${playerUuid}`}};
            }


            const exists = DynamoDbUtils.tableExists('games');
            exists
                .then((d) => {this.scanGames(params, resolve, reject); })
                .catch(async (err) => {
                    const gameKeys: Attribute[] = [{name: 'uuid', type: AttributeTypesEnum.STRING}];
                    await DynamoDbUtils.createTable('games', gameKeys);
                    resolve([]);
                });

        });
    }
    private static scanGames(params: ScanInput, resolve: any, reject: any) {
        dynamoDb.scan(params, function(err: any, data: any) {
            if (err) {
              console.error(`Scan Error ${JSON.stringify(err)}`);
                reject(err);
            } else {
                const games: IGameModel[] = [];
                data.Items.forEach((item: any) => {
                    console.log(`item:${JSON.stringify(item)}`);
                    try {
                        const game: IGameModel = {
                                local: item.local.S,
                                uuid: item.uuid.S,
                                name: item.name.S,
                                player1Uuid: item.player1Uuid.S,
                                player2Uuid: item.player2Uuid.S,
                                state: item.state.N,
                                activePlayer: item.activePlayer.N,
                                createDateTime: item.createDateTime.S
                        };
                        games.push(game);

                    } catch (err) {
                        if (err.name === 'ResourceNotFoundException') {
                            const gameKeys: Attribute[] = [{name: 'uuid', type: AttributeTypesEnum.STRING}];
                            DynamoDbUtils.createTable('games', gameKeys)
                                .then(() => {
                                    resolve([]);
                                })
                                .catch((e) => {
                                    console.error(`Error ${e}`);
                                    reject(e);
                                });
                        } else {
                            console.error(`Error ${err}`);
                            reject(err);
                        }
                    }
                });
                resolve(games);
            }
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
                    console.error('Unable to get Item . Error JSON:', JSON.stringify(err, null, 2));
                    reject(err);
                } else {
//                    console.log(`Item: ${JSON.stringify(data.Item)}`);
                    const cards = JSON.parse(data.Item.cards.S);
                    const updateDateTime = (data.Item.updateDateTime ? data.Item.updateDateTime.S : data.Item.createDateTime.S);
                    const game: IGameModel = {
                                                uuid: gameUuid,
                                                name: data.Item.name.S,
                                                player1Uuid: data.Item.player1Uuid.S,
                                                player2Uuid: data.Item.player2Uuid.S,
                                                activePlayer: data.Item.activePlayer.N,
                                                state: data.Item.state.N,
                                                createDateTime: data.Item.createDateTime.S,
                                                updateDateTime: updateDateTime,
                                                cards: cards,
                                                local: (data.Item.local.S === 'true')
                                            };
                    resolve(game);
                }
            });
        });
    }
}
