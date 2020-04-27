import * as uuid from 'uuid';
import {IGameModel, GameFactory} from 's-n-m-lib';

import { DynamoDB, DynamoDBClient, DynamoDBConfiguration, PutItemInput } from '@aws-sdk/client-dynamodb-v2-node';

const config: DynamoDBConfiguration = {endpoint: 'http://localhost:8000'};
const dynamoDb = new DynamoDB(config);

export class GameAPI{
    new(game:IGameModel):Promise<IGameModel>{
        return new Promise<IGameModel>((resolve,reject)=>{
            let newGame:IGameModel;
            if(!game){throw 'game required';}
            if(!game.uuid){
                newGame=GameFactory.newGame(game.name,game.player1Uuid,game.player2Uuid);
            }else{
                newGame=game;
            }
            const g=newGame;
            delete g.uuid;
            delete g.name;
            delete g.player1Uuid;
            delete g.player2Uuid;
            
            const item = {
              TableName: 'games',
              Item: {
                'uuid': { S: `${newGame.uuid}` },
                'name': { S: `${newGame.name}` },
                'player1Uuid': { S: `${newGame.player1Uuid}` },
                'player2Uuid': { S: `${newGame.player2Uuid}` },
                'game': { S: `${JSON.stringify(g)}` }
                  }
            };
            dynamoDb.putItem(item, function(err: any, data: any) {
              if (err) {
                  console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
                  reject(err);
              } else {
                  console.log('Put Item . Item description JSON:', JSON.stringify(data, null, 2));
                  resolve(newGame);
              }
           });
        });
    }
} 

/*
const AWS = require('aws-sdk');
let documentClient = new AWS.DynamoDB.DocumentClient({    'region': 'eu-west-1'});

module.exports = class DB {    
    get(key, value, table) {
        
        return new Promise((resolve, reject) => {
            if (!table) {
                throw 'table needed';    
            }
            if (typeof key !== 'string') {
                throw `key was not string and was ${JSON.stringify(key)} on table ${table}`;
            }
            if (typeof value !== 'string') {
                throw `value was not string and was ${JSON.stringify(value)} on table ${table}`;
            
            }
            let params = {    TableName: table,    Key: {[key]: value}};
            documentClient.get(params, function(err, data) {
                if (err) {
                        console.log(`There was an error fetching the data for ${key} ${value} on table ${table}`, err);
                        return reject(err);
                }    
                return resolve(data.Item);
            });
        });
    }    
    write(ID, data, table) {
        return new Promise((resolve, reject) => {    
            if (typeof ID !== 'string') 
                throw `the id must be a string and not ${ID}`;    
            if (!data) 
                throw "data is needed";    
            if (!table) 
                throw 'table name is needed';
            let params = {TableName: table,Item: { ...data, ID: ID }    };
            documentClient.put(params, function(err, result) {
                if (err) {
                    console.log("Err in writeForCall writing messages to dynamo:", err);
                    console.log(params);
                    return reject(err);        
                }        
                console.log('wrote data to table ', table)        
                return resolve({ ...result.Attributes, ...params.Item });    
             });
         });
    }    
    async increment(ID, table) {
        if (!table) throw 'table needed';    
        if (!ID) throw 'ID needed';    
        let data;    
        try {        
            data = await this.get('movie-genre', ID, table);
            if (!data.count) throw 'no count in data'    
        } catch (err) {            
            data = { "movie-genre": ID, count: 0 };    
        }    
        let newData = { ...data, count: data.count + 1 };    
        return this.write(ID, newData, table);
    }
}

*/