const Errors = require('./Errors');

function genBaseResponse(statusCode) {
    let response = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            // 'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'POST,PUT,DELETE,GET,OPTIONS'
        }
    };
    if (statusCode) {
        response.statusCode = statusCode;
    }
    return response;
}

module.exports.error = (err) => {

    // Error should be APIError
    if (!(err instanceof Errors.APIError)) {
        err = new Errors.APIError(500, Errors.CODES.ERR_SYSTEM_ERROR, err.message);
    }

    let res = genBaseResponse(err.httpStatus);

    // Create body
    let body = {success: false, code: err.code};

    if (err.message) {
        body.message = err.message;
    }

    if (err.errors) {
        body.errors = err.errors;
    }

    // Stringify body
    res.body = JSON.stringify(body);
    return res;
};

module.exports.success = (data) => {

    let res = genBaseResponse(200);

    // Create body
    let body = {success: true};

    if (data) {
        body.data = data;
    }

    // Stringify body
    res.body = JSON.stringify(body);
    return res;
};
