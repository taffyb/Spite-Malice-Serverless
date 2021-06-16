import {verifier, ClaimVerifyResult} from './JWTVerifyer';


exports.handler = async (event:any , context:any , callback:any ) => {
  console.log(`${JSON.stringify(event,null,2)}`);
  
  const JWT={token:event.queryStringParameters.token};
  
  // const JWT = {token:"eyJraWQiOiIzZVJudmZvb0tDVU9ETllDQTQ1YjMwRm82WVYwNDg0WFhHS2tySEFmZVRFPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxMDhkYzI5My1mNjM4LTRiMTAtYjUwYi1kMWJhYTcwYzQyNzEiLCJhdWQiOiIzN282ZGNwc2IwN3ZuNGI5MzcydWZxYmVqYiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjFkYzliYzBmLTdiNDctNGFkMC1iMjQ4LTRlOWUxOGM4MjQ1NSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjIwMjg2MTM4LCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0yLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMl9LSENORDVKdmMiLCJjb2duaXRvOnVzZXJuYW1lIjoidGFmZnkiLCJleHAiOjE2MjIyMTg0MzIsImlhdCI6MTYyMjIxNDgzMiwiZW1haWwiOiJicmVja25vY2t0QGdtYWlsLmNvbSJ9.JDRB_SpT_4ad9Ik8fAzaZ46LdGveSfGWo5YZ48T2Ue7qCv67VGkr1UoSIYYCQUxOoghlHP6emRD4yCPQJd1Z3R4AJbJQewGBWQcYzxiwjhVnM29_eRD_ScIYER1qYqLouJ_PhnnuAiELTpoq7EFQopkgJ5YtJN7tw0IdCmCi2CVrRySDY2VsxNwk1qRU_CozRj5JWdugKPRLeYnyAfrIZcw26942cOfUWZYJpQuIX9O8LQJ9rZ5SAKy-9yRW7tt_JPbeN-9CmG_JtF39bfNWW0bK7bKR-dz_Fhyr5ylaGcFgWWLert2ahkhSwJnbtmw4T2h3PoinZz0OwSij3OxHIg"}

  const verified:ClaimVerifyResult = await verifier(JWT);
    console.log(`${JSON.stringify(verified,null, 2)}`);
    let policy:PolicyDocument;
    if(verified.isValid){
      policy = generateAllow(verified.userId,'arn:aws:execute-api:eu-west-2:841044393207:24gu6qsupj/*/$connect');
      console.log(`ALLOW:${JSON.stringify(policy,null, 2)}`);
      callback(null,policy);
    }else{
      console.log(`DENY`);
      callback("Unauthorized");
    }
};

interface PolicyStatement{
  Action:string,
  Effect:string,
  Resource:string
};

interface PolicyDocument{
  Version:string,
  Statement:PolicyStatement[];
}

// Help function to generate an IAM policy
function generatePolicy (principalId:string, effect:any, resource:any) {
  // Required output:
  var authResponse:any = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
      var policyDocument:PolicyDocument = {Version:'',Statement:[]};
      policyDocument.Version = '2012-10-17'; // default version
      policyDocument.Statement = [];
      var statementOne:PolicyStatement = {Action:'',Effect:'',Resource:''};
      statementOne.Action = 'execute-api:Invoke'; // default action
      statementOne.Effect = effect;
      statementOne.Resource = resource;
      policyDocument.Statement[0] = statementOne;
      authResponse.policyDocument = policyDocument;
  }
  // Optional output with custom properties of the String, Number or Boolean type.
  authResponse.context = {
      "sub": principalId
  };
  return authResponse;
}
   
var generateAllow = function(principalId:string, resource:string) {
  return generatePolicy(principalId, 'Allow', resource);
}
   
var generateDeny = function(principalId:string, resource:string) {
  return generatePolicy(principalId, 'Deny', resource);
}