const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    let updateExpression="set updated=:u, ";
    let expressionAttributeValues={":u":Date.now()};
    let expressionAttributeNames={};

    let i = 97; //a
    var params = {
        TableName:"sm_players",
        Key:{
            'uuid': event.sub
        },
        ReturnValues:"UPDATED_NEW"
    };
    let element;
    for(element in event.player){
        let alpha= String.fromCharCode(i++);
        updateExpression+=`#${alpha}=:${alpha}, `;
        expressionAttributeValues[`:${alpha}`]=event.player[element];
        expressionAttributeNames[`#${alpha}`]=element
    }
    updateExpression=updateExpression.substr(0,updateExpression.length-2);
    params['UpdateExpression']=updateExpression;
    params['ExpressionAttributeValues']=expressionAttributeValues;
    params['ExpressionAttributeNames']=expressionAttributeNames;
    console.log(`Updating the item...\n${JSON.stringify(params)}`);
    const result = await docClient.update(params).promise();
    
    callback(null,result);
};
