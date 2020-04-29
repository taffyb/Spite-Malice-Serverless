import { DynamoDB, DynamoDBClient, DynamoDBConfiguration, PutItemInput } from '@aws-sdk/client-dynamodb-v2-node';

const config: DynamoDBConfiguration = {endpoint: 'http://localhost:8000'};
const dynamoDb = new DynamoDB(config);

export class DynamoDbUtils {
    static createTable(name: string, key: {name: string, type: string}): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const params = {
                            TableName: name,
                            KeySchema: [{ AttributeName: key.name, KeyType: 'HASH'}],
                            AttributeDefinitions: [{ AttributeName: key.name, AttributeType: key.type }],
                            ProvisionedThroughput: { ReadCapacityUnits: 1, WriteCapacityUnits: 1 }
                        };
            dynamoDb.createTable(params, function(err: any, data: any) {
                if (err) {
                    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
                    resolve(err);
                } else {
                    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
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
                    console.error('Unable to describe table. Error JSON:', JSON.stringify(err, null, 2));
                    reject(false);
                } else {
                    console.log('Table Exists. Table description JSON:', JSON.stringify(data, null, 2));
                    resolve(true);
                }
             });
        });
    }
}
