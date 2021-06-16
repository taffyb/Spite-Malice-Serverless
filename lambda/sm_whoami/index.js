
/*
    Expect to be called via API Gateway as an authenticated endpoint.
    The Authentication Subject is passed through
*/

exports.handler = (event, context, callback) => {
    console.log(`Event:${JSON.stringify(event)}`);

    callback(null,event.sub);
}