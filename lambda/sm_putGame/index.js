const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    let updateExpression="set updated=:u, ";
    let expressionAttributeValues={":u":Date.now()};
    let expressionAttributeNames={};

    let i = 97; //a
    var params = {
        TableName:"sm_games",
        Key:{
            'uuid': event.gameUuid
        },
        ReturnValues:"UPDATED_NEW"
    };
    let element;
    for(element in event.game){
        let alpha= String.fromCharCode(i++);
        updateExpression+=`#${alpha}=:${alpha}, `;
        expressionAttributeNames[`#${alpha}`]=element
        if(element=="cards"){
            const numberArr=[];
            const cardArr=event.game.cards;
            for(let i=0;i<cardArr.length;i++){
                numberArr.push([]);
                for(let j=0;j<cardArr[i].length;j++){
                    numberArr[i].push(cardArr[i][j].cardNo);
                }
            }
            expressionAttributeValues[`:${alpha}`]=numberArr;
        }else{
            expressionAttributeValues[`:${alpha}`]=event.game[element];
        }
    }
    updateExpression=updateExpression.substr(0,updateExpression.length-2);
    params['UpdateExpression']=updateExpression;
    params['ExpressionAttributeValues']=expressionAttributeValues;
    params['ExpressionAttributeNames']=expressionAttributeNames;
    console.log(`Updating the item...\n${JSON.stringify(params)}`);
    const result = await docClient.update(params).promise();
    
    callback(null,result);
};
