module.exports = {

    getUserIdFromContext: function(event) {
        if(!event['username'])
            return event['username'];
        return null;
    }

};