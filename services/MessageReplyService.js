const AWS = require('aws-sdk');



// function close(sessionAttributes, fulfillmentState, message) {
//     response = {
//         'sessionAttributes': session_attributes,
//         'dialogAction': {
//             'type': 'Close',
//             'fulfillmentState': fulfillment_state,
//             'message': message
//         }
//     };
//
//     return response;
// }




module.exports.getReply = (userId, msg) => {
    return new Promise((resolve, reject) => {
        let lexRunTime = new AWS.LexRuntime();

        lexParams = {
            botAlias: '$LATEST',
            botName: 'RestaurantSuggestion',
            inputText: msg,
            userId: userId,
            sessionAttributes: {}
        };

        lexRunTime.postText(lexParams, (err, response) => {
            if(err) {
                console.log(err);
                reject(err);
                return;
            }
            console.log(response);
            resolve(response.message);
        });

        // resolve('Hello! you said: "' + msg + '" ?');
    });



};


