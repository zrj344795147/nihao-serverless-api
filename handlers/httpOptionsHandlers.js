const ResponseBuilder = require('../utils/ResponseBuilder');


module.exports.handle = (event, context, callback) => {
    console.log('Handle Options');
    callback(null, ResponseBuilder.success());
};