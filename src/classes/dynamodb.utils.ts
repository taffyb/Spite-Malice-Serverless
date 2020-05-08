import { DynamoDB, DynamoDBClient, DynamoDBConfiguration, CreateTableInput } from '@aws-sdk/client-dynamodb-v2-node';
import {AttributeTypesEnum, Attribute} from './dynamodb.types';

const config: DynamoDBConfiguration = {endpoint: 'http://localhost:8000'};
const dynamoDb = new DynamoDB(config);

export class DynamoDbUtils {
    static createTable(name: string, keys: Attribute[]): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            let params: CreateTableInput;
            if (keys.length > 1) {
                params = {
                        TableName: name,
                        KeySchema: [{ AttributeName: keys[0].name, KeyType: 'HASH'},
                                    { AttributeName: keys[1].name, KeyType: 'SORT'}],
                        AttributeDefinitions: [{ AttributeName: keys[0].name, AttributeType: keys[0].type },
                                               { AttributeName: keys[1].name, AttributeType: keys[1].type }],
                        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
                      };
            } else {
                params = {
                        TableName: name,
                        KeySchema: [{ AttributeName: keys[0].name, KeyType: 'HASH'}],
                        AttributeDefinitions: [{ AttributeName: keys[0].name, AttributeType: keys[0].type }],
                        ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
                      };
            }
            dynamoDb.createTable(params, function(err: any, data: any) {
                if (err) {
                    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
                    resolve(err);
                } else {
//                    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
                    resolve(true);
                }
             });
        });
    }
    static tableExists(name: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const params = {
                            TableName: name
                           };
            dynamoDb.describeTable(params, function(err: any, data: any) {
                if (err) {
//                    console.error('Unable to describe table. Error JSON:', JSON.stringify(err, null, 2));
                    reject(false);
                } else {
//                    console.log('Table Exists. Table description JSON:', JSON.stringify(data, null, 2));
                    resolve(true);
                }
             });
        });
    }
}
