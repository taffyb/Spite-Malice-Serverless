const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    event.Records.forEach((record)=>{

        let playerUuid = record.dynamodb.NewImage.uuid.S;
        let oldOpponents=[]; 
        if(record.dynamodb.OldImage && record.dynamodb.OldImage.opponents){
            oldOpponents= record.dynamodb.OldImage.opponents.SS;
        }
        let newOpponents=[];  
        if(record.dynamodb.NewImage && record.dynamodb.NewImage.opponents){
            newOpponents= record.dynamodb.NewImage.opponents.SS;
        }
    
        // console.log(`newOpponents:${JSON.stringify(newOpponents)} oldOpponents:${JSON.stringify(oldOpponents)}`);
        if(newOpponents.length>oldOpponents.length){
            let opponents;
            if(oldOpponents.length==0){
                opponents = newOpponents;
    
            }else{
                opponents = newOpponents.filter((uuid)=>{return !hasElement(oldOpponents,uuid);});
            } 
            opponents.forEach((p)=>{
                const item1 = {
                    TableName: "sm_opponents",
                    Item: {
                        'created': Date.now(),
                        'p1Uuid': playerUuid,
                        'p2Uuid': p,
                        'score_card':{}
                    }
                };
                // console.log(`Item to Add: ${JSON.stringify(item1.Item)}`);
                docClient.put(item1, (err, data) => {
                    if (err) {
                        console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
                    } else {
                        console.log(`SUCESS Added opponent: ${JSON.stringify(item1.Item)}`);
                    }
                });
                const item2 = {
                    TableName: "sm_opponents",
                    Item: {
                        'created': Date.now(),
                        'p1Uuid': p,
                        'p2Uuid': playerUuid,
                        'score_card':{}
                    }
                };
                // console.log(`Item to Add: ${JSON.stringify(item2.Item)}`);
                docClient.put(item2, (err, data) => {
                    if (err) {
                        console.error('Unable to put Item . Error JSON:', JSON.stringify(err, null, 2));
                    } else {
                        console.log(`SUCESS Added opponent: ${JSON.stringify(item2.Item)}`);
                    }
                });
            });
            
        }
    });
     
    callback();
};

function hasElement(array,item){
    let rtn = false;

    array.forEach((e)=>{
        if(e===item){
            rtn=true;
        }
    });
    return rtn;
}