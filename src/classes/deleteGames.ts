import {DynamoDbUtils} from './dynamodb.utils';
import {IGameModel} from 's-n-m-lib';
import {GameAPI} from './game.api';

import { DynamoDB, DynamoDBConfiguration} from '@aws-sdk/client-dynamodb-v2-node';

const config: DynamoDBConfiguration = {endpoint: 'http://localhost:8000'};
const dynamoDb = new DynamoDB(config);

const games$ = GameAPI.getGames();
games$
.then((games: IGameModel[]) => {
    games.forEach((game) => {
        dynamoDb.deleteTable({TableName: `${game.uuid}`}, function(err: any, data: any) {
            if (err) {console.log(`Error deleting table ${game.uuid}: ${JSON.stringify(err)} `); }
        });
    });
    dynamoDb.deleteTable({TableName: `games`}, function(err: any, data: any) {
        if (err) {console.log(`Error deleting table games: ${JSON.stringify(err)} `); }
    });
    console.log(`Deleting ${games.length} tables `);
})
.catch((err) => {console.log(`ERROR: ${err}`); });
