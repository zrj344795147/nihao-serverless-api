'use strict';

//Utils
const AuthUtil = require("../utils/AuthUtil");
const ResponseBuilder = require('../utils/ResponseBuilder');
const Errors = require('../utils/Errors');
//Services
const MessageReplyService = require('../services/MessageReplyService');


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

    MessageReplyService.getReply(message)
        .then((res) => {
            callback(null, ResponseBuilder.success(res));
        })
        .catch(err => {
            callback(null, ResponseBuilder.error(new Errors.APIError(500, Errors.CODES.ERR_SYSTEM_ERROR, err.message)));
        });

};
