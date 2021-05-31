const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

let send = undefined;
function init(event) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: event.requestContext.domainName + '/' + event.requestContext.stage
  });
  send = async (connectionId, data) => {
    await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: data}).promise();
  }
}

exports.handler = async(event) => {
  console.log(`Event:${JSON.stringify(event,null,2)}`);
  var bodyString = event.body;
  var bodyObject = JSON.parse(bodyString);
  const connectionId = event.requestContext.connectionId;

  let params ={
    TableName:"sm_players",    
    Key: {
      uuid: bodyObject.player2Uuid
    },
    AttributesToGet: ["uuid","wsConnectionId"],
  }
  console.log(`params:${JSON.stringify(params,null,2)}`);
  const opponent = await docClient.get(params).promise();
  console.log(`opponent:${JSON.stringify(opponent.Item,null,2)}`);
  
  if(opponent.Item.wsConnectionId){
    let msg={
      action:"invitation",
      from:event.requestContext.authorizer.sub,
      gameUuid:bodyObject.gameUuid,
      message:bodyObject.message
    };
    init(event);
    send(opponent.Item.wsConnectionId, JSON.stringify(msg));
    console.log(`Player[${event.requestContext.authorizer.sub}]\nsent invite:\n${JSON.stringify(msg,null,2)}\nto:${connectionId}`);
  
  }
    // the return value is ignored when this function is invoked from WebSocket gateway
    return {statusCode:200,body:"Invitation Sent"};
};
