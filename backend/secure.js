var crypto = require("crypto");
var config = require("./config");
var defaultHmacDigest = 'sha256';

module.exports = {
    getHmacForUserId : function(userId) {
        var hmac = crypto.createHmac(defaultHmacDigest, config.hmac_secret);
        hmac.update(userId.toString());
        return hmac.digest("hex");
    }
}
