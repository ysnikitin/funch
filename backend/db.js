var mysql = require('mysql');
var express = require('express');
var nodemailer = require('nodemailer');
var btoa = require('btoa');
var moment = require('moment');
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

var filterOneRow = function(rows) {
    return rows.length > 0 ? rows[0] : {};
}

var convertCommaDelimToArray = function(commaDelim) {
    if(commaDelim === null) {
        return [];
    } else {
        return commaDelim.split(',');
    }
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
                callback(filterOneRow(results));
            }
        });
    },

    restaurantInsert : function(name, address, phone, menu, callback, next) {
        connection.query("INSERT INTO funch.restaurants (name, address, phone, menu) VALUES (?,?,?,?);", [name, address, phone, menu], function(err, result) {
            if(err) {
                next(err);
            } else {
                callback({"id":result.insertId});
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

        if(Object.keys(params).length === 0) {
            callback(false);
        }

        var first = true;
        var queryValues = [];
        var setClause = "";
        for(var param in params) {
            if (!first) {
                setClause += ", ";
            }
            setClause += "`" + param + "` = ?";
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
        "LEFT JOIN funch.duty d ON l.id = d.lunchId " +
        "WHERE l.id = ? " +
        "GROUP BY l.id;", [id], function(err, results) {
            if(err) {
                next(err);
            } else {
                var row = filterOneRow(results);
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

    lunchAdd : function(rid, stoptime, notes, onduty, limit, callback, next) {
        var mtime = moment(stoptime);
        var mytime = mtime.format("YYYY-MM-DD HH:mm:ss")
        // call is active
        var after = function(retUsers) {
            connection.query("INSERT INTO funch.lunches (restaurantId, created, stoptime, notes, `limit`) VALUES(?, NOW(), ?, ?, ?); ", [rid, mytime, notes, limit], function (err, result) {
                if (err) {
                    next(err);
                } else {
                    var insertOnDuty = function(newLunchId) {
                        var emailUsers = function() {
                            for (var i in retUsers) {
                                var user = retUsers[i];
                                var code = encodeURIComponent(btoa(JSON.stringify({
                                    "lunchId": newLunchId,
                                    "userId": user['id']
                                })));
                                var mailOptions = {
                                    from: "Funch Bunch", // sender address
                                    to: user['email'], // list of receivers
                                    subject: 'Funch Is Here', // Subject line
                                    text: "Please order lunch here!\n" + "URL: http://" + config.server_ip + "/#/lunch/" + code // plaintext body
                                };
                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        return console.log(error);
                                    } else {
                                        console.log('Message sent: ' + info.response);
                                    }
                                })
                            }
                            callback({"id": newLunchId});
                        }
                        if(onduty.length === 0) {
                            emailUsers();
                        } else {
                            var query = "INSERT INTO funch.duty (lunchId, userId) VALUES ";
                            var params = [];
                            var first = true;
                            for(var dindx in onduty) {
                                var duty = onduty[dindx];
                                if(!first) {
                                    query += ", ";
                                }
                                query += "(?,?)";
                                params.push(newLunchId);
                                params.push(duty);
                                first = false;
                            }
                            query += ";";
                            connection.query(query, params, function (err2, result2) {
                                if(err2) {
                                    next(err2);
                                } else {
                                    emailUsers();
                                }
                            });
                        }

                    }
                    insertOnDuty(result.insertId);
                }
            });
        }
        this.users(after, next);
    },

    lunchEmail : function(lid, name, email, initials, callback, next) {
        var emailUser = function(newUserId) {
            var code = encodeURIComponent(btoa(JSON.stringify({
                "lunchId": lid,
                "userId": newUserId
            })));
            var mailOptions = {
                from: "Funch Bunch", // sender address
                to: email, // list of receivers
                subject: 'Funch Is Here', // Subject line
                text: "Please order lunch here!\n" + "URL: http://" + config.server_ip + "/#/lunch/" + code // plaintext body
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    return console.log(error);
                } else {
                    console.log('Message sent: ' + info.response);
                }
            })
            callback({"id": newUserId });
        }
        this.usersAdd(name, email, false, initials, emailUser, next);
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

    lunchUpdate : function(id, params, callback, next) {

        if(Object.keys(params).length === 0) {
            callback(false);
        }

        var first = true;
        var queryValues = [];
        var setClause = "";
        var hasOnDuty = false;
        for(var param in params) {
            if (!first) {
                setClause += ", ";
            }
            if(param === 'onduty') {
                if(Object.keys(params).length === 1) {
                    callback(false);
                }
                hasOnDuty = true;
                continue;
            }
            setClause += "`" + param + "` = ?";
            first = false;
            queryValues.push(params[param]);
        }
        queryValues.push(id);
        connection.query("UPDATE funch.lunches SET " + setClause + " WHERE id = ? ", queryValues, function(err, result) {
            if(err) {
                next(err);
            } else {
                callback(result.changedRows === 1);
            }
        });

    },

    user : function(id, callback, next) {
        connection.query("SELECT * FROM funch.users WHERE id = ?;", [id], function(err, results) {
            if(err) {
                next(err);
            } else {
                convertTinyIntToBool(results, 'perm');
                callback(filterOneRow(results));
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

    usersAdd : function(name, email, perm, initials, callback, next) {
        connection.query("INSERT INTO funch.users (`name`, email, perm, initials) VALUES (?,?,?, ?);", [name, email, perm, initials], function(err, result) {
            if(err) {
                next(err);
            } else {
                callback({"id" : result.insertId});
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

    order : function(lid, oid, callback, next) {
        connection.query("SELECT * FROM funch.orders WHERE lunchId =? AND id = ?; ", [lid, oid], function(err, results) {
            if(err) {
                next(err);
            } else {
                callback(filterOneRow(results));
            }
        });
    },

    orders : function(lid, callback, next) {
        connection.query("SELECT * FROM funch.orders WHERE lunchId =?; ", [lid], function(err, results) {
            if(err) {
                next(err);
            } else {
                callback(results);
            }
        });
    },

    ordersInsert : function(lid, body, callback, next) {
        var params = [];
        var first = true;
        var query = "INSERT INTO funch.orders (`order`, userId, lunchId, ordertime) VALUES ";
        if(Array.isArray(body) === false) {
            body = [body];
        }
        for(var dindx in body) {
            var order = body[dindx];
            if(order.order === undefined || order.userId === undefined) {
                continue;
            }
            if(!first) {
                query += ", ";
            }
            query += "(?,?,?,NOW())";
            params.push(order.order);
            params.push(order.userId);
            params.push(lid);
            first = false;
        }
        connection.query(query, params, function(err, result) {
            if(err) {
                next(err);
            } else {
                callback({"id" : result.insertId});
            }
        });
    },

    orderDelete : function(lid, oid, callback, next) {
        connection.query("DELETE FROM funch.orders WHERE lunchId = ? AND id = ?;", [lid, oid], function(err, result) {
            if(err) {
                next(err);
            } else {
                callback(result.affectedRows > 0);
            }
        });
    },

    orderUpdate : function(lid, oid, params, callback, next) {

        if(Object.keys(params).length === 0) {
            callback(false);
        }

        var first = true;
        var queryValues = [];
        var setClause = "";
        for(var param in params) {
            if (!first) {
                setClause += ", ";
            }
            setClause += "`" + param + "` = ?";
            first = false;
            queryValues.push(params[param]);
        }
        queryValues.push(oid);
        queryValues.push(lid);
        connection.query("UPDATE funch.orders SET " + setClause + ", ordertime = NOW() WHERE id = ? and lunchId = ?", queryValues, function(err, result) {
            if(err) {
                next(err);
            } else {
                callback(result.changedRows > 0);
            }
        });
    },


}


