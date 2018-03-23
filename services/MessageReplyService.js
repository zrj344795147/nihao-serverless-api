


module.exports.getReply = (msg) => {
    return new Promise((resolve, reject) => {
        resolve('Hello! you said: "' + msg + '" ?');
    })
};


