var mysql = require('mysql');
var express = require('express');
var nodemailer = require('nodemailer');
var btoa = require('btoa');
var moment = require('moment');
var config = require("./config");
var secure = require("./secure");
var q = require('q');

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

var query = function (sql, args) {
    var d = q.defer();
    connection.query(sql, args, function (err, res) {
        if (err) {
            d.reject(err);
        } else {
            d.resolve(res);
        }
    });
    return d.promise;
};

module.exports = {

    restaurants : function(callback, next) {
        query("SELECT * FROM funch.restaurants").then(function (res) {
            callback(res);
        }).catch(function (err) {
            next(err);
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
        query("INSERT INTO funch.restaurants (name, address, phone, menu) VALUES (?,?,?,?)", [name, address, phone, menu]).then(function (res) {
            return query("SELECT * FROM funch.restaurants WHERE id = ?", [res.insertId]);
        }).then(function (res) {
           callback(filterOneRow(res));
        }).catch(function (err) {
           next(err);
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

        query("UPDATE funch.restaurants SET " + setClause + " WHERE id = ? ", queryValues).then(function (res) {
            return query("SELECT * FROM funch.restaurants WHERE id = ?", [id]);
        }).then(function (res) {
           callback(filterOneRow(res));
        }).catch(function (err) {
           next(err);
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

    lunches : function(callback, next) {
        connection.query("SELECT l.*, GROUP_CONCAT(d.userId) AS onduty " +
            "FROM funch.lunches l " +
            "LEFT JOIN funch.duty d ON l.id = d.lunchId " +
            "GROUP BY l.id;", function(err, results) {
            if(err) {
                next(err);
            } else {
                for(var i = 0; i < results.length; i++) {
                    var result = results[i];
                    result['onduty'] = convertCommaDelimToArray(result['onduty']);
                }
                callback(results);
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
                                if(user['email'] === 'jeremy.nikitin@retroficiency.com' || user['email'] === 'tangiblelime@gmail.com') {
                                    transporter.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                            return console.log(error);
                                        } else {
                                            console.log('Message sent: ' + info.response);
                                        }
                                    })
                                }
                            }
                            callback({"id": newLunchId});
                        }
                        if(onduty.length === 0) {
                            emailUsers();
                        } else {
                            var insertQuery = "INSERT INTO funch.duty (lunchId, userId) VALUES ";
                            var params = [];
                            var first = true;
                            for(var dindx in onduty) {
                                var duty = onduty[dindx];
                                if(!first) {
                                    insertQuery += ", ";
                                }
                                insertQuery += "(?,?)";
                                params.push(newLunchId);
                                params.push(duty);
                                first = false;
                            }
                            insertQuery += ";";
                            connection.query(insertQuery, params, function (err2, result2) {
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

        query("UPDATE funch.lunches SET " + setClause + " WHERE id = ? ", queryValues).then(function (res) {
            return query("SELECT * FROM funch.lunches WHERE id = ?", [id]);
        }).then(function (res) {
           callback(filterOneRow(res));
        }).catch(function (err) {
           next(err);
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
        query("INSERT INTO funch.users (`name`, email, perm, initials) VALUES (?,?,?, ?);", [name, email, perm, initials]).then(function (res) {
            return query("SELECT * FROM funch.users WHERE id = ?", [res.insertId]);
        }).then(function (res) {
           callback(filterOneRow(res));
        }).catch(function (err) {
           next(err);
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
        var insertQuery = "INSERT INTO funch.orders (`order`, userId, lunchId, ordertime) VALUES ";
        if(Array.isArray(body) === false) {
            body = [body];
        }
        for(var dindx in body) {
            var order = body[dindx];
            if(order.order === undefined || order.userId === undefined) {
                continue;
            }
            if(!first) {
                insertQuery += ", ";
            }
            insertQuery += "(?,?,?,NOW())";
            params.push(order.order);
            params.push(order.userId);
            params.push(lid);
            first = false;
        }

        query(insertQuery, params).then(function (res) {
            return query("SELECT * FROM funch.orders WHERE id = ?", [res.insertId]);
        }).then(function (res) {
           callback(filterOneRow(res));
        }).catch(function (err) {
           next(err);
        });
    },

    orderDelete : function(lid, oid, callback, next) {

        query("DELETE FROM funch.orders WHERE lunchId = ? AND id = ?;", [lid, oid]).then(function (result) {
            callback(result.affectedRows > 0);
        }).catch(function (err) {
            next(err);
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

        query("UPDATE funch.orders SET " + setClause + ", ordertime = NOW() WHERE id = ? and lunchId = ?", queryValues).then(function (res) {
            return query("SELECT * FROM funch.orders WHERE id = ?", [oid]);
        }).then(function (res) {
           callback(filterOneRow(res));
        }).catch(function (err) {
           next(err);
        });
    },

    getUserLunchDetailsForHash : function(hash, callback, next) {

        query("SELECT userId, lunchId FROM funch.hashes WHERE hash =?", hash).then(function(results) {
            callback(filterOneRow(results));
        }).catch(function (err) {
            next(err);
        });

    },

    generateHashForUserLunchDetails : function(userId, lunchId, callback, next) {

        var hash = secure.getHashForUserLunch(userId, lunchId);
        query("INSERT INTO funch.hashes (userId, lunchId, hash) VALUES(?,?,?)", [userId, lunchId, hash]).then(function(result) {
            callback({"hash":hash});
        }).catch(function (err) {
            next(err);
        });

    },

    userVote : function(rid, uid, callback, next) {

        query("ELECT * FROM funch.votes WHERE userId =? AND restaurantId =? LIMIT 1;", [uid, rid]).then(function (result) {
            convertTinyIntToBool(result, 'upvote');
            convertTinyIntToBool(result, 'downvote');
            callback(filterOneRow(result));
        }).catch(function (err) {
            next(err);
        });

    }

}
