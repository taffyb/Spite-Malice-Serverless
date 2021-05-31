const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

function getOpponentConnectionsAsync(playerUuid){
    console.log(`getOpponentConnectionsAsync.playerUuid: ${playerUuid}`);
    return new Promise((resolve, reject)=>{
    let opponentConnections = [];
    let params = {
        TableName: 'sm_opponents',
        KeyConditionExpression: 'p1Uuid = :p1Uuid',
        ExpressionAttributeValues: {
          ':p1Uuid': playerUuid
        }
      };
    docClient.query(params,(err,data)=> {
        if (err){ 
            console.log(err);
            reject(err);
        }else{ 
            console.log(data);
            resolve(data);
        }
     });
    });
}
module.exports = getOpponentConnectionsAsync;