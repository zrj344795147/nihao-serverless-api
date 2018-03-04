//
// Error codes - used by clients as internationalization keys for error messages
//
module.exports.CODES = {
    ERR_AUTH_CODE_MISMATCH: "ERR_AUTH_CODE_MISMATCH",
    ERR_BAD_INPUT: "ERR_BAD_INPUT",
    ERR_FEATURE_NOT_IMPLEMENTED: "ERR_FEATURE_NOT_IMPLEMENTED",
    ERR_FORBIDDEN: "ERR_FORBIDDEN",
    ERR_INVALID_CODE: "ERR_INVALID_CODE",
    ERR_INVALID_EMAIL:"ERR_INVALID_EMAIL",
    ERR_INVALID_INPUT: "ERR_INVALID_INPUT",
    ERR_INVALID_PASSWORD: "ERR_INVALID_PASSWORD",
    ERR_INVALID_PHONE: "ERR_INVALID_PHONE",
    ERR_INVALID_USERNAME: "ERR_INVALID_USERNAME",
    ERR_LIMIT_EXCEEDED: "ERR_LIMIT_EXCEEDED",
    ERR_NOT_FOUND: "ERR_NOT_FOUND",
    ERR_UNAUTHORIZED: "ERR_UNAUTHORIZED",
    ERR_USER_ALREADY_EXISTS: "ERR_USER_ALREADY_EXISTS",
    ERR_USER_NOT_CONFIRMED: "ERR_USER_NOT_CONFIRMED",
    ERR_USER_NOT_FOUND: "ERR_USER_NOT_FOUND",
    ERR_USER_ALREADY_CONFIRMED: "ERR_USER_ALREADY_CONFIRMED",
    ERR_SYSTEM_ERROR: "ERR_SYSTEM_ERROR",
};

//
// Error classes
//

module.exports.APIError = class APIError extends Error {
    /**
     * @param {number} httpStatus the HTTP status code normally associated with this error
     * @param {string} code error code, e.g. "ERR_USER_ALREADY_EXISTS"
     * @param {string} message error message, e.g. "User already exists"
     * @param {Object.<string, string>} errors field-specific errors
     */
    constructor(httpStatus, code, message, errors) {
        super(message);
        this.httpStatus = httpStatus;
        this.code = code;
        this.errors = errors;
    }
};
