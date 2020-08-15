const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context, callback) => {
    if(event.Records[0].eventName=="INSERT"){
        console.log(JSON.stringify(event.Records[0].dynamodb.NewImage, null, 2));
    }
     
    callback();
};