var fs       = require('fs');
var path     = require('path');
var jsonfile = require('jsonfile');
var merge    = require('merge');

var cfg = {
    'mysql_username' : undefined,
    'mysql_password' : undefined,
    'mysql_schema' : undefined,
    'mysql_host' : undefined,
    'mysql_port' : undefined,
    'hmac_secret' : undefined
};

var other = {};
var othercfg = path.join('config.json');
if (fs.existsSync(othercfg)) {
    other = jsonfile.readFileSync(othercfg);
}

module.exports = merge.recursive(cfg, other);
