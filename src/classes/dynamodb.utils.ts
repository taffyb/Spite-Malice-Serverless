import * as AWS from 'aws-sdk';
AWS.config.update({region: 'eu-west-2'});
import {DynamoDB} from 'aws-sdk';
import {AttributeTypesEnum, Attribute} from './dynamodb.types';

const dynamoDb = new AWS.DynamoDB();

export class DynamoDbUtils {
    static tableExists(name: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const params = {
                TableName: name
            };
            dynamoDb.describeTable(params, function(err: any, data: any) {
                if (err) {
                    reject(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
}
