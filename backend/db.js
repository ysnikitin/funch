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
    for(var i = 0; i < rows.length; i++) {
        var row = rows[i];
        row[columnName] = (row[columnName] === 1);
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

var emailPromise = function (email, title, body) {
    var d = q.defer();
    var mailOptions = {
        from: "Funch Bunch", // sender address
        to: email, // list of receivers
        subject: title, // Subject line
        text: body // plaintext body
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            d.reject(error);
        } else {
            console.log('Message sent: ' + info.response);
            d.resolve(info.response);
        }
    });
    return d.promise();
};

module.exports = {

    restaurants : function(next) {

        return query("SELECT * FROM funch.restaurants").
        then(function (res) {
            return res;
        }).catch(function (err) {
            next(err);
        });

    },

    restaurant : function(id, callback, next) {

        return query("SELECT * FROM funch.restaurants WHERE id = ? LIMIT 1;", [id]).
        then(function (res) {
            return filterOneRow(res);
        }).catch(function (err) {
            next(err);
        });

    },

    restaurantInsert : function(name, address, phone, menu, yelpURL, next) {

        return query("INSERT INTO funch.restaurants (name, address, phone, menu, yelpURL) VALUES (?,?,?,?, ?);", [name, address, phone, menu, yelpURL]).
        then(function (res) {
            return query("SELECT * FROM funch.restaurants WHERE id = ? LIMIT 1;", [res.insertId]);
        }).then(function (res) {
           return filterOneRow(res);
        }).catch(function (err) {
           next(err);
        });

    },

    restaurantFavorites : function(next) {

        return query("SELECT f.* " +
                "FROM funch.restaurants f " +
                "JOIN funch.lunches l ON l.restaurantId = f.id " +
                "GROUP BY f.id " +
                "ORDER BY COUNT(*) DESC " +
                "LIMIT 5;").
        then(function (res) {
            return(res);
        }).catch(function (err) {
            next(err);
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

    restaurantDelete: function(id, next) {

        return query("DELETE FROM funch.restaurants WHERE id = ?;", [id]).
        then(function (res) {
            return res.affectedRows === 1;
        }).catch(function (err) {
            next(err);
        });

    },

    lunch : function(id, callback, next) {

        query("SELECT l.*, GROUP_CONCAT(d.userId) AS onduty " +
            "FROM funch.lunches l " +
            "LEFT JOIN funch.duty d ON l.id = d.lunchId " +
            "WHERE l.id = ? " +
            "GROUP BY l.id;", [id]).
        then(function (res) {
            var row = filterOneRow(res);
            row['onduty'] = convertCommaDelimToArray(row['onduty']);
            callback(row);
        }).catch(function (err) {
            next(err);
        });

    },

    lunches : function(callback, next) {

        query("SELECT l.*, GROUP_CONCAT(d.userId) AS onduty " +
            "FROM funch.lunches l " +
            "LEFT JOIN funch.duty d ON l.id = d.lunchId " +
            "GROUP BY l.id;").
        then(function (res) {
            for(var i = 0; i < res.length; i++) {
                var result = res[i];
                result['onduty'] = convertCommaDelimToArray(result['onduty']);
            }
            callback(res);
        }).catch(function (err) {
            next(err);
        });

    },

    lunchActive : function(callback, next) {

        query("SELECT id FROM funch.lunches WHERE DATE(stoptime) = DATE(NOW()) OR DATE(created) = DATE(NOW())").
        then(function (res) {
            if(res.length === 0) {
                callback({});
            } else {
                callback({"id" : res[0]['id']});
            }
        }).catch(function (err) {
            next(err);
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
            });
            callback({"id": newUserId });
        };
        this.usersAdd(name, email, false, initials, emailUser, next);
    },

    lunchDelete : function(id, callback, next) {

        query("DELETE FROM funch.lunches WHERE id = ?;", [id]).then(function (res) {
            callback(res.affectedRows === 1);
        }).catch(function (err) {
            next(err);
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

    user : function(id, next) {

        return query("SELECT * FROM funch.users WHERE id = ? LIMIT 1;", [id]).then(function (res) {
            convertTinyIntToBool(res, 'perm');
            return filterOneRow(res);
        }).catch(function (err) {
            next(err);
        });

    },

    users : function(callback, next) {

        query("SELECT * FROM funch.users WHERE perm = 1;").then(function (res) {
            convertTinyIntToBool(res, 'perm');
            callback(res);
        }).catch(function (err) {
            next(err);
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

        query("SELECT * FROM funch.recommendations WHERE userId =? AND restaurantId = ?;", [uid, rid]).then(function (res) {
            callback(res);
        }).catch(function (err) {
            next(err);
        });

    },

    quickpicks : function(rid, callback, next) {

        query("SELECT * FROM funch.quickpicks WHERE restaurantId =?; ", [rid]).then(function (res) {
            callback(res);
        }).catch(function (err) {
            next(err);
        });

    },

    order : function(lid, oid, callback, next) {

        query("SELECT * FROM funch.orders WHERE lunchId =? AND id = ?; ", [lid, oid]).then(function (res) {
            callback(filterOneRow(res));
        }).catch(function (err) {
            next(err);
        });

    },

    orders : function(lid, callback, next) {

        query("SELECT * FROM funch.orders WHERE lunchId =?; ", [lid]).then(function (res) {
            callback(res);
        }).catch(function (err) {
            next(err);
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
