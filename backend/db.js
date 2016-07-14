var mysql = require('mysql');
var express = require('express');
var nodemailer = require('nodemailer');
var btoa = require('btoa');
var config = require("./config");

//var transporter = nodemailer.createTransport('smtps://' + config.email_username + '%40gmail.com:' + config.email_password + '@smtp.gmail.com');
var transporter = nodemailer.createTransport({service: 'Gmail',
    auth: {
        user: config.email_username,
        pass: config.email_password
    }});

var connection = mysql.createConnection({
    host     : config.mysql_host,
    port     : config.mysql_port,
    user     : config.mysql_username,
    password : config.mysql_password,
    database : config.mysql_schema
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
    if (err) throw "Cannot connect to MySQL!";
});

var fitlerOneRow = function(rows) {
    return rows.length > 0 ? rows[0] : {};
}

var convertCommaDelimToArray = function(commaDelim) {
    return commaDelim.split(',');
}

var convertTinyIntToBool = function(rows, columnName) {
    for(var row in rows) {
        rows[row][columnName] = (rows[row][columnName] === 1);
    }
}

module.exports = {

    restaurants : function(callback, next) {
        connection.query("SELECT * FROM funch.restaurants;", function(err, results) {
            if(err) {
                next(err);
            } else {
                callback(results);
            }
        });
    },

    restaurant : function(id, callback, next) {
        connection.query("SELECT * FROM funch.restaurants WHERE id = ? LIMIT 1;", [id], function(err, results) {
            if(err) {
                next(err);
            } else {
                callback(fitlerOneRow(results));
            }
        });
    },

    restaurantFavorites : function(callback, next) {
        connection.query("SELECT f.* " +
        "FROM funch.restaurants f " +
        "JOIN funch.lunches l ON l.restaurantId = f.id " +
        "GROUP BY l.id " +
        "ORDER BY COUNT(*) DESC " +
        "LIMIT 5;", function(err, results) {
            if(err) {
                next(err);
            } else {
                callback(results);
            }
        });
    },

    restaurantUpdate : function(id, params, callback, next) {

        if(params.length === 0) {
            return false;
        }

        var first = true;
        var queryValues = [];
        var setClause = "";
        for(var param in params) {
            if (!first) {
                params += ", ";
            }
            setClause += param + " = ?";
            first = false;
            queryValues.push(params[param]);
        }
        queryValues.push(id);
        connection.query("UPDATE funch.restaurants SET " + setClause + " WHERE id = ? ", queryValues, function(err, result) {
            if(err) {
                next(err);
            } else {
                callback(result.changedRows === 1);
            }
        });
    },

    lunch : function(id, callback, next) {
        connection.query("SELECT l.*, GROUP_CONCAT(d.userId) AS onduty " +
        "FROM funch.lunches l " +
        "JOIN funch.duty d ON l.id = d.lunchId " +
        "WHERE l.id = 1 " +
        "GROUP BY l.id;", [id], function(err, results) {
            if(err) {
                next(err);
            } else {
                var row = fitlerOneRow(results);
                row['onduty'] = convertCommaDelimToArray(row['onduty']);
                callback(row);
            }
        });
    },

    lunchActive : function(callback, next) {
        connection.query("SELECT id FROM funch.lunches WHERE DATE(stoptime) = DATE(NOW()) OR DATE(created) = DATE(NOW())", function(err, results) {
            if(err) {
                next(err);
            } else {
                if(results.length === 0) {
                    callback({});
                } else {
                    callback({"id" : results[0]['id']});
                }
            }
        });
    },

    lunchAdd : function(rid, stoptime, notes, callback, next) {
        // call is active
        var after = function(retUsers) {
            connection.query("INSERT INTO funch.lunches (restaurantId, created, stoptime, notes) VALUES(?, NOW(), ?, ?); ", [rid, stoptime, notes], function (err, result) {
                if (err) {
                    next(err);
                } else {
                    var newLunchId = result.insertId;
                    for(var i in retUsers) {
                        var user = retUsers[i];
                        var code = encodeURIComponent(btoa(JSON.stringify({"lunchId" : newLunchId, "userId" : user['id']})));
                        var mailOptions = {
                            from: "Funch Bunch", // sender address
                            to: user['email'], // list of receivers
                            subject: 'Funch Is Here', // Subject line
                            text: "Please order lunch here!\n" + "URL: http://" + config.server_ip + "/#/lunch/" + code // plaintext body
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                return console.log(error);
                            } else {
                                console.log('Message sent: ' + info.response);
                            }
                        })
                    }
                    callback({"id: ": newLunchId});
                }
            });
        }
        this.users(after, next);
    },

    lunchDelete : function(id, callback, next) {
        connection.query("DELETE FROM funch.lunches WHERE id = ?;", [id], function(err, result) {
            if(err) {
                next(err);
            } else {
                callback(result.affectedRows === 1);
            }
        });
    },

    user : function(id, callback, next) {
        connection.query("SELECT * FROM funch.users WHERE id = ?;", [id], function(err, results) {
            if(err) {
                next(err);
            } else {
                convertTinyIntToBool(results, 'perm');
                callback(fitlerOneRow(results));
            }
        });
    },

    users : function(callback, next) {
        connection.query("SELECT * FROM funch.users WHERE perm = 1;", function(err, results) {
            if(err) {
                next(err);
            } else {
                convertTinyIntToBool(results, 'perm');
                callback(results);
            }
        });
    },

    usersAdd : function(name, email, perm, callback, next) {
        connection.query("INSERT INTO funch.users (name, email, perm) VALUES (?,?,?);", [name, email, perm], function(err, result) {
            if(err) {
                next(err);
            } else {
                callback(result.insertId);
            }
        });
    },

    recommendations : function(uid, rid, callback, next) {
        connection.query("SELECT * FROM funch.recommendations WHERE userId =? AND restaurantId = ?", [uid, rid], function(err, results) {
            if(err) {
                next(err);
            } else {
                callback(results);
            }
        });
    },

    quickpicks : function(rid, callback, next) {
        connection.query("SELECT * FROM funch.quickpicks WHERE restaurantId =?; ", [rid], function(err, results) {
            if(err) {
                next(err);
            } else {
                callback(results);
            }
        });
    },

}


