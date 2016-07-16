var crypto = require("crypto");
var config = require("./config");
var defaultDigest = 'sha256';

module.exports = {
    getHashForUserLunch : function(userId, lunchId) {
        var ulObj = {'userId': userId, 'lunchId' : lunchId};
        var ulStr = JSON.stringify(ulObj);
        return crypto.createHash(defaultDigest).update(ulStr, 'utf8').digest('hex');
    }
}