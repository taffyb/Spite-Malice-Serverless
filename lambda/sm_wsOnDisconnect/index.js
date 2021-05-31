const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async  (event) => { 
  const connectionId = event.requestContext.connectionId; 
  const playerUuid = event.requestContext.authorizer.sub; 

  var params = {
    TableName:"sm_players",
    Key:{
        'uuid': playerUuid
    },
    UpdateExpression:`REMOVE wsConnected, wsConnectionId SET status=""`,
    ReturnValues:"UPDATED_NEW"
  };

  console.log(`Updating the item...\n${JSON.stringify(params)}`);
  const result = await docClient.update(params).promise();
  console.log(`Result:\n${JSON.stringify(result,null,2)}`);
  return { 
    statusCode: 200, 
    body:"disconnected"
  };
}
