// Packages
const AWS = require('aws-sdk');
const yelp = require('yelp-fusion');
// Configs
const yelpApiKey = 'RS5xFR5EjvEsNEhAyN5sxFG0FnzmFdsJ6TyZoV6tXUpRI-FEJXxRouwTq54K_0a-DJCxag8L7wpjahFxz-GR1iSxYMfpv6oM3cVZoz9J-upyiP8ztxQ26g3B8n69WnYx';
// AWS.config.update({region: 'us-east-1'});

module.exports.lexValidateHookHandler = (event, context, callback) => {
    console.log(event);
    if(event.currentIntent.name !== 'RestuarantQuery') {
        console.log('Error lex response');
        return;
    }

    let delegateOutput = {
        sessionAttributes: event.sessionAttributes,
        dialogAction: {
            type: 'Delegate',
            slots: event.currentIntent.slots,
        },
    };

    let elicitOutput = {
        sessionAttributes: event.sessionAttributes,
        dialogAction: {
            type: 'ElicitSlot',
            message: {
                contentType: "PlainText",
                content: "Sorry? What city?"
            },
            intentName: event.currentIntent.name,
            slots: event.currentIntent.slots,
            slotToElicit : "",
        },
    };

    // City
    if(event.currentIntent.slots.area !== 'null') {
        if(event.currentIntent.slots.area === 'test') {
            elicitOutput.dialogAction.slotToElicit = 'area';
            callback(null, elicitOutput);
            return;
        }
    }
    // Email
    if(event.currentIntent.slots.email !== 'null') {

    }
    // Food
    if(event.currentIntent.slots.food !== 'null') {

    }
    // Number Of People
    if(event.currentIntent.slots.numberOfPeople !== 'null') {

    }
    // Time
    if(event.currentIntent.slots.time !== 'null') {

    }

    callback(null, delegateOutput);
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
                // message: {
                //     contentType: "PlainText",
                //     content: "You're all set. Expect my recommendations shortly! Have a good day."
                // }
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

    // const sns = new AWS.SNS();
    const ses = new AWS.SES( );

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
            //delete msg
            let deleteParams = {
                QueueUrl: sqsUrl,
                ReceiptHandle: data.Messages[i].ReceiptHandle
            };
            sqs.deleteMessage(deleteParams, (err, res) => {
                if (err) {
                    console.log("Delete Error ", err);
                    return;
                }
                console.log("Message Deleted ", res);
                // Deal with msg
                let info = JSON.parse(data.Messages[i].Body);
                // console.log(info.area);
                let searchRequest = {
                    term: 'Restaurant',
                    location: info.area,
                    categories: info.food,
                    // open_at: ,
                    limit: 3
                };
                console.log(searchRequest);
                yelpClient.search(searchRequest)
                    .then(result => {
                        console.log(result);
                        // Reply content
                        let body = JSON.parse(result.body);
                        let content = '';
                        if(body.businesses.length === 0) {
                            content = 'Sorry, we cannot find any restaurant meeting your requirement.';
                        }
                        else {
                            content += 'Hello! Here are my restaurant suggestions for you: \n\n';
                            for(let i = 0; i < body.businesses.length; i++) {
                                let business = body.businesses[i];
                                content += business.name + '\n';
                                content += 'Location: ' + business.location.display_address[0] + ' '+ business.location.display_address[1] + '\n';
                                content += 'Phone: ' + business.phone + '\n';
                                content += '\n';
                            }
                        }

                        //send email
                        const sesParams = {
                            Destination: {
                                ToAddresses:[info.email]
                            },
                            Source: 'rz1189@nyu.edu',
                            Message: {
                                Body: {
                                    Text: {
                                        Charset: "UTF-8",
                                        Data: content
                                    }
                                },
                                Subject: {
                                    Data: 'Restaurant Suggestions'
                                },
                            },
                        };
                        ses.sendEmail(sesParams, (err, res) => {
                            if(err) {
                                console.log(err);
                                return;
                            }
                            console.log('Email sent to ');
                        });
                    })
                    .catch(err=> {
                        console.log(err);

                        // Send email
                        const sesParams = {
                            Destination: {
                                ToAddresses:[info.email]
                            },
                            Source: 'rz1189@nyu.edu',
                            Message: {
                                Body: {
                                    Text: {
                                        Charset: "UTF-8",
                                        Data: 'Sorry, we cannot find any restaurant meeting your requirement.'
                                    }
                                },
                                Subject: {
                                    Data: 'Restaurant Suggestions'
                                },
                            },
                        };
                        ses.sendEmail(sesParams, (err, res) => {
                            if(err) {
                                console.log(err);
                                return;
                            }
                            console.log('Email sent to ');
                        });
                    });
            });

        }
    });
};
