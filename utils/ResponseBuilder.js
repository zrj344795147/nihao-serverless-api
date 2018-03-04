const Errors = require('./Errors');

module.exports.error = (err) => {

    // Error should be APIError
    if (!(err instanceof Errors.APIError)) {
        err = new Errors.APIError(500, Errors.CODES.ERR_SYSTEM_ERROR, err.message);
    }

    let res = {statusCode: err.httpStatus};

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

    let res = {statusCode: 200};

    // Create body
    let body = {success: true};

    if (data) {
        body.data = data;
    }

    // Stringify body
    res.body = JSON.stringify(body);
    return res;
};