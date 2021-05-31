const getOpponentConnectionsAsync = require('opponentConnections');
const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

let send = undefined;
function init(event) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  send = async (connectionId, data) => {
    await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: data }).promise();
  }
}

exports.handler = async  (event) => { 
  const connectionId = event.requestContext.connectionId; 
  const playerUuid = event.requestContext.authorizer.sub; 
 
  /*
    Update the player to store the connection ID so we can communicate with them
  */
  var params = {
    TableName:"sm_players",
    Key:{
        'uuid': playerUuid
    },
    UpdateExpression:"SET wsConnected=:u, wsConnectionId=:c, #s=:s",
    ExpressionAttributeValues:{
        ":u":Date.now(),
        ":c":connectionId,
        ":s":"ONLINE"
    },
    ExpressionAttributeNames:{
      "#s":"status"
    },
    ReturnValues:"UPDATED_NEW"
  };

  console.log(`Updating the item...\n${JSON.stringify(params)}`);
  const result = await docClient.update(params).promise();

  /*
    Find of our opponents and let any of them that are online know that we have connected
  */
  init(event);
  const opponents = await getOpponentConnectionsAsync(playerUuid);
  console.log(`opponents:${JSON.stringify(opponents,null,2)}`);
  opponents.Items.forEach(opponent => {
    let msg = {
      action:"status-change",
      playerUuid:playerUuid,
      status:"connected"
    }
    send(opponent.wsConnectionId,msg);
  });
    
  console.log(`Result:\n${JSON.stringify(result,null,2)}`);
  return { 
    statusCode: 200, 
    body:"connected"
  };
}