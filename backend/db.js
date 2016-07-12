var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : '127.0.0.1',
    port     : 3306,
    user     : 'root',
    password : 'pikachu',
    database : 'funch'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
    if (err) throw err;
});

exports.newSession = function(location, menuUrl, notes, callback) {
    connection.query("INSERT INTO funch.sessions (location, menuUrl, notes, time) VALUES (?, ?, ?, NOW());", [location, menuUrl, notes], function(err, result) {
        if (err) throw err;
        callback(result.insertId);
    });
}

exports.sessions = function(callback) {
    connection.query("SELECT * FROM funch.sessions;", function(err, results) {
        if (err) throw err;
        callback(results);
    });
}