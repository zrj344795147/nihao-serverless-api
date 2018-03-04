'use strict';

//Utils
const AuthUtil = require("../utils/AuthUtil");
const ResponseBuilder = require('../utils/ResponseBuilder');
const Errors = require('../utils/Errors');
//Services
const HelloWorldService = require('../services/HelloWorldService');


module.exports.replyMessage = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    console.log("Ready to reply message");
    //get userId by auth
    let userId = AuthUtil.getUserIdFromContext(event);

    if (!userId) {
        callback(null, ResponseBuilder.error(new Errors.APIError(400, Errors.CODES.ERR_BAD_INPUT, "Missing requestContext.authorizer.claims")));
        return;
    }
    //parse
    let body = null;
    try {
        body = JSON.parse(event.body);
    } catch (err) {
        callback(null, ResponseBuilder.error(new Errors.APIError(400, Errors.CODES.ERR_BAD_INPUT, "Parse Failed")));
    }

    if(!body.message) {
        callback(null, ResponseBuilder.error(new Errors.APIError(400, Errors.CODES.ERR_BAD_INPUT, "No Message")));
    }
    //get reply
    HelloWorldService.getReply(body.message)
        .then((res) => {
            callback(null, ResponseBuilder.success(res));
        })
        .catch(err => {
            callback(null, ResponseBuilder.error(new Errors.APIError(500, Errors.CODES.ERR_SYSTEM_ERROR, err.message)));
        });

};
