'use strict';

// Utils
const AuthUtil = require("../utils/AuthUtil");
const ResponseBuilder = require('../utils/ResponseBuilder');
const Errors = require('../utils/Errors');
// Services
const MessageReplyService = require('../services/MessageReplyService');
// Packages
const AWS = require('aws-sdk');
const yelp = require('yelp-fusion');
// Configs
const yelpApiKey = 'RS5xFR5EjvEsNEhAyN5sxFG0FnzmFdsJ6TyZoV6tXUpRI-FEJXxRouwTq54K_0a-DJCxag8L7wpjahFxz-GR1iSxYMfpv6oM3cVZoz9J-upyiP8ztxQ26g3B8n69WnYx';
// AWS.config.update({region: 'us-east-1'});


module.exports.replyMessage = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    // get userId by auth
    let userId = AuthUtil.getUserIdFromContext(event);
    console.log('userId: ' + userId);
    //
    if (!userId) {

        callback(null, ResponseBuilder.error(new Errors.APIError(400, Errors.CODES.ERR_BAD_INPUT, "Missing requestContext.authorizer.claims")));
        return;
    }

    //parse
    let body = null;
    try {
        body = JSON.parse(event.body);
    } catch (err) {
        callback(null, ResponseBuilder.error(new Errors.APIError(400, Errors.CODES.ERR_BAD_INPUT, 'Parse Error')));
        return;
    }
    console.log(body);
    if(!body || !body['message']) {
        callback(null, ResponseBuilder.error(new Errors.APIError(400, Errors.CODES.ERR_BAD_INPUT)));
        return;
    }
    let message = body.message;

    MessageReplyService.getReply(userId, message)
        .then((res) => {
            callback(null, ResponseBuilder.success(res));
        })
        .catch(err => {
            callback(null, ResponseBuilder.error(new Errors.APIError(500, Errors.CODES.ERR_SYSTEM_ERROR, err.message)));
        });

};

//
module.exports.lexFulfilledHookHandler = (event, context, callback) => {
    if(event.currentIntent.name !== 'RestuarantQuery') {
        console.log('Error lex response');
    }
    console.log(event.currentIntent.slots);

    const sqs = new AWS.SQS();
    const url = 'https://sqs.us-east-1.amazonaws.com/646898565065/NihaoSQS';
    let param = {
        MessageBody: JSON.stringify(event.currentIntent.slots),
        // MessageAttributes: event.slots,
        QueueUrl: url,
    };
    sqs.sendMessage(param, (err, data) => {
       if(err) {
           console.log(err);
           return;
       }

       callback(null, {
           sessionAttributes: {},
           dialogAction: {
               type: "Close",
               fulfillmentState: "Fulfilled",
               message: {
                   contentType: "PlainText",
                   content: "Have a good day."
               }
           }
        });
    });


};


// function sendToPhone(){
//
// }

module.exports.checkMessageQueue= (event, context, callback) => {
    console.log('Check Message Queue.');

    const sqs = new AWS.SQS();
    const sqsUrl = 'https://sqs.us-east-1.amazonaws.com/646898565065/NihaoSQS';
    const sqsParam = {
        QueueUrl: sqsUrl,
    };

    const sns = new AWS.SNS();
    // const ses = new AWS.SES( );

    console.log('Initialize yelp');
    const yelpClient = yelp.client(yelpApiKey);

    sqs.receiveMessage(sqsParam, (err, data) => {
        if(err) {
            console.log(err);
            return;
        }
        if(!data.Messages){
            console.log("No message");
            return;
        }

        for(let i = 0; i < data.Messages.length; i++) {
            let info = JSON.parse(data.Messages[i].Body);
            // console.log(info.area);
            let searchRequest = {
               term: 'Restaurant',
               location: info.area,
               categories: info.food,
               limit: 3
            };
            console.log(searchRequest);
            yelpClient.search(searchRequest)
                .then(request => {
                    console.log(request);
                    //send SMS
                    const snsParams = {
                        Message: 'this is a test message',
                        MessageStructure: 'string',
                        PhoneNumber: '+13473273080'
                    };
                    sns.publish(snsParams, (err, res) => {
                        if(err) {
                            console.log(err);
                            return;
                        }
                        console.log('SMS sent');
                        //delete msg
                        let deleteParams = {
                            QueueUrl: sqsUrl,
                            ReceiptHandle: data.Messages[i].ReceiptHandle
                        };
                        sqs.deleteMessage(deleteParams, (err, data) => {
                            if (err) {
                                console.log("Delete Error", err);
                            } else {
                                console.log("Message Deleted", data);
                            }
                        });
                    });

                })
                .catch(err=> {
                    console.log(err);
                });
        }
    });
};
