var crypto = require("crypto");
var config = require("./config");
var defaultDigest = 'sha256';

module.exports = {
    getHashForUserLunch : function(userId, lunchId) {
        var ulObj = {'userId': parseInt(userId), 'lunchId' : parseInt(lunchId)};
        var ulStr = JSON.stringify(ulObj);
        return crypto.createHash(defaultDigest).update(ulStr, 'utf8').digest('hex');
    }
}