module.exports = {

    getUserIdFromContext: function(event) {
        if (!event.requestContext || !event.requestContext.authorizer || !event.requestContext.authorizer.claims) {
            return null;
        }

        return event.requestContext.authorizer.claims.sub;
    }

};