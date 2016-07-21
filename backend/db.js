var mysql = require('mysql');
var express = require('express');
var nodemailer = require('nodemailer');
var sesTransport  = require('nodemailer-ses-transport');
var btoa = require('btoa');
var moment = require('moment-timezone');
var config = require("./config");
var secure = require("./secure");
var q = require('q');
var ejs = require('ejs');

//var transporter = nodemailer.createTransport('smtps://' + config.email_username + '%40gmail.com:' + config.email_password + '@smtp.gmail.com');
var transporter = nodemailer.createTransport(sesTransport({
    accessKeyId: config.ses_key,
    secretAccessKey: config.ses_secret,
    rateLimit: 12 // do not send more than 5 messages in a second
}));

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

var emailtemplate = '<b style="font-family: Arial, sans-serif; text-decoration: overline; font-size: 30px">FUNCH</b>' +
    '<br>' +
    '<br>' +
    '<span style="font-family: Arial, sans-serif">It\'s time to order your lunch for <%= due_date %>!</span>' +
    '<br>' +
    '<br>' +
    '<b style="font-family: Arial, sans-serif">RESTAURANT...</b>' +
    '<br>' +
    '<span style="font-family: Arial, sans-serif"><%= restaurant %></span>' +
    '<br>' +
    '<br>' +
    '<b style="font-family: Arial, sans-serif">ORDERS DUE BY...</b>' +
    '<br>' +
    '<span style="font-family: Arial, sans-serif"><%= due_time %></span>' +
    '<br>' +
    '<br>' +
    '<span style="font-family: Arial, sans-serif">Click the link below to get started:</span>' +
    '<br>' +
    '<a href="<%= link %>"><%= link %></a>';

var filterOneRow = function(rows) {
    return rows.length > 0 ? rows[0] : {};
}

var isDef = function(val) {
    return val !== undefined;
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

var emailPromise = function (email, title, dueDate, restaurantName, dueTime, link) {
    var template = ejs.compile(emailtemplate, {
        rmWhitespace: false
    });

    var body = template({
        due_date: dueDate,
        restaurant: restaurantName,
        due_time: dueTime,
        link: link
    });

    var d = q.defer();
    var mailOptions = {
        from: "munch@funchbun.ch", // sender address
        to: email, // list of receivers
        subject: title, // Subject line
        html: body // plaintext body
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            d.reject(error);
        } else {
            console.log('Message sent: ' + info.response);
            d.resolve(info.response);
        }
    });
    return d.promise;
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

    restaurant : function(id, next) {

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

    restaurantUpdate : function(id, params, next) {

        if(Object.keys(params).length === 0) {
            return q(false);
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

        return query("UPDATE funch.restaurants SET " + setClause + " WHERE id = ? ", queryValues).then(function (res) {
            return query("SELECT * FROM funch.restaurants WHERE id = ?", [id]);
        }).then(function (res) {
           return filterOneRow(res);
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

    lunch : function(id, next) {

        return query("SELECT l.*, GROUP_CONCAT(d.userId) AS onduty " +
            "FROM funch.lunches l " +
            "LEFT JOIN funch.duty d ON l.id = d.lunchId " +
            "WHERE l.id = ? " +
            "GROUP BY l.id;", [id]).
        then(function (res) {
            var row = filterOneRow(res);
            if(row['onduty'] !== undefined) {
                row['onduty'] = convertCommaDelimToArray(row['onduty']);
            }
            return row;
        }).catch(function (err) {
            next(err);
        });

    },

    lunches : function(next) {

        return query("SELECT l.*, GROUP_CONCAT(d.userId) AS onduty " +
            "FROM funch.lunches l " +
            "LEFT JOIN funch.duty d ON l.id = d.lunchId " +
            "GROUP BY l.id;").
        then(function (res) {
            for(var i = 0; i < res.length; i++) {
                var result = res[i];
                result['onduty'] = convertCommaDelimToArray(result['onduty']);
            }
            return res;
        }).catch(function (err) {
            next(err);
        });

    },

    lunchActive : function(next) {

        return query("SELECT id FROM funch.lunches WHERE DATE(stoptime) > NOW() ORDER BY DATE(stoptime) DESC LIMIT 1").
        then(function (res) {
            if(res.length === 0) {
                return {};
            } else {
                return {"id" : res[0]['id']};
            }
        }).catch(function (err) {
            next(err);
        });

    },

    lunchAdd : function(rid, stoptime, notes, onduty, limit, next) {
        var mtime = moment(stoptime);
        var mytime = mtime.format("YYYY-MM-DD HH:mm:ss")

        var self = this;
        return query("INSERT INTO funch.lunches (restaurantId, created, stoptime, notes, `limit`) VALUES(?, NOW(), ?, ?, ?); ", [rid, mytime, notes, limit]).then(function(result) {
            var newLunchId = result.insertId;
            if (onduty.length > 0) {
                var insertQuery = "INSERT INTO funch.duty (lunchId, userId) VALUES ";
                var params = [];
                var first = true;
                for (var dindx in onduty) {
                    var duty = onduty[dindx];
                    if (!first) {
                        insertQuery += ", ";
                    }
                    insertQuery += "(?,?)";
                    params.push(newLunchId);
                    params.push(duty);
                    first = false;
                }
                insertQuery += ";";
                return query(insertQuery, params).then(function(result) {
                    return self.users(next).then(function(users) {
                        return self.lunch(newLunchId, next).then(function(lunch) {
                            return self.restaurant(lunch['restaurantId'], next).then(function(restaurant) {
                                var emails = [];
                                for (var i in users) {
                                    var user = users[i];
                                    var hash = secure.getHashForUserLunch(user['id'], newLunchId);
                                    var dueDate = moment(lunch['stoptime']).tz('America/New_York').format('MMMM Do');
                                    var dueTime = moment(lunch['stoptime']).tz('America/New_York').format('h:mm a')
                                    emails.push(emailPromise(user['email'], 'Funch Is Here', dueDate, restaurant['name'], dueTime, 'http://' + config.server_ip + '/#/lunch/' + hash));
                                }
                                return q.all(emails).then(function(result) {
                                    return self.lunch(newLunchId, next);
                                });
                            })
                        })
                    });
                });
            }
        }).catch(function (err) { // // var emailPromise = function (email, title, dueDate, restaurantName, dueTime, link) {
            next(err);
        });
    },

    lunchEmail : function(lid, name, email, initials, next) {

        var self = this;
        return self.usersAdd(name, email, false, initials, next).then(function(user) {
            var hash = secure.getHashForUserLunch(user.id, lid);
            return self.lunch(lid, next).then(function(lunch) {
                return self.restaurant(lunch['restaurantId'], next).then(function(restaurant) {
                    var dueDate = moment(lunch['stoptime']).tz('America/New_York').format('MMMM Do');
                    var dueTime = moment(lunch['stoptime']).tz('America/New_York').format('h:mm a')
                    return emailPromise(email, 'Funch Is Here', dueDate, restaurant['name'], dueTime, 'http://' + config.server_ip + '/#/lunch/' + hash).then(function(result) {
                        return user;
                    })
                })

            });
        }).catch (function(err) {
            next(err);
        });

    },

    lunchResendEmail : function(lid, uid, next) {

        // email, title, dueDate, restaurantName, dueTime,, link
        var self = this;
        var hash = secure.getHashForUserLunch(uid, lid);
        return this.user(uid, next).then(function(user) {
            return self.lunch(lid, next).then(function(lunch) {
                return self.restaurant(lunch['restaurantId']).then(function(restaurant) {
                    var dueDate = moment(lunch['stoptime']).tz('America/New_York').format('MMMM Do');
                    var dueTime = moment(lunch['stoptime']).tz('America/New_York').format('h:mm a')
                    return emailPromise(user['email'], 'Funch Is Here', dueDate, restaurant['name'], dueTime, 'http://' + config.server_ip + '/#/lunch/' + hash);
                });
            })
        }).catch(function (err) {
            next(err);
        })

    },

    lunchDelete : function(id, next) {

        return query("DELETE FROM funch.lunches WHERE id = ?;", [id]).then(function (res) {
            return res.affectedRows === 1;
        }).catch(function (err) {
            next(err);
        });

    },

    lunchUpdate : function(id, params, next) {

        if(Object.keys(params).length === 0) {
            return q(false);
        }

        var first = true;
        var queryValues = [];
        var setClause = "";
        var dutyArray = false;
        for(var param in params) {
            if(param === 'onduty') {
                dutyArray = params[param];
                if(!Array.isArray(dutyArray)) {
                    dutyArray = JSON.parse(dutyArray);
                }
                continue;
            }
            if(param === 'stoptime') {
                var mtime = moment(params[param]);
                params[param] = mtime.format("YYYY-MM-DD HH:mm:ss")
            }
            if (!first) {
                setClause += ", ";
            }
            setClause += "`" + param + "` = ?";
            first = false;
            queryValues.push(params[param]);
        }
        queryValues.push(id);

        var self = this;
        return query("UPDATE funch.lunches SET " + setClause + " WHERE id = ? ", queryValues).then(function (res) {
            if(dutyArray && dutyArray.length > 0) {
                return query("DELETE FROM funch.duty WHERE lunchId = ?;", id).then(function(res) {
                    if(dutyArray.length > 0) {
                        var dutyClause = "";
                        for (var i = 0; i < dutyArray.length; i++) {
                            if (i > 0) {
                                dutyClause += ", "
                            }
                            dutyClause += " (" + id + "," + dutyArray[i] + ") ";
                        }
                        return query("INSERT INTO funch.duty (lunchId, userId) VALUES " + dutyClause + ";")
                    }
                });
            }
        }).then(function (res) {
            return self.lunch(id, next);
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

    users : function(next) {

        return query("SELECT * FROM funch.users WHERE perm = 1;").then(function (res) {
            convertTinyIntToBool(res, 'perm');
            return res;
        }).catch(function (err) {
            next(err);
        });

    },

    usersAdd : function(name, email, perm, initials, next) {
        if(!isDef(name) || !isDef(email) || !isDef(perm) || !isDef(initials)) {
            next(new Error("All parameters must be set!"));
            return q(false);
        }
        var self = this;
        return query("INSERT INTO funch.users (`name`, email, perm, initials) VALUES (?,?,?, ?);", [name, email, perm, initials]).then(function (res) {
            return self.user(res.insertId, next);
        }).catch(function (err) {
           next(err);
        });
    },

    recommendations : function(uid, rid, next) {

        return query("SELECT * FROM funch.recommendations WHERE userId =? AND restaurantId = ? ORDER BY `order`;", [uid, rid]).then(function (res) {
            return res;
        }).catch(function (err) {
            next(err);
        });

    },

    quickpicks : function(rid, next) {

        return query("SELECT * FROM funch.quickpicks WHERE restaurantId =? ORDER BY `order`; ", [rid]).then(function (res) {
            return res;
        }).catch(function (err) {
            next(err);
        });

    },

    order : function(lid, oid, next) {

        return query("SELECT * FROM funch.orders WHERE lunchId =? AND id = ?; ", [lid, oid]).then(function (res) {
            return filterOneRow(res);
        }).catch(function (err) {
            next(err);
        });

    },

    orders : function(lid, next) {

        return query("SELECT * FROM funch.orders WHERE lunchId =?; ", [lid]).then(function (res) {
            return res;
        }).catch(function (err) {
            next(err);
        });

    },

    ordersInsert : function(lid, body, next) {
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

        if(params.length === 0) {
            return q(false);
        }

        var self = this;
        return query(insertQuery, params).then(function (res) {
            return self.order(lid, res.insertId, next);
        }).catch(function (err) {
           next(err);
        });
    },

    orderDelete : function(lid, oid, next) {

        return query("DELETE FROM funch.orders WHERE lunchId = ? AND id = ?;", [lid, oid]).then(function (result) {
            return result.affectedRows > 0;
        }).catch(function (err) {
            next(err);
        });

    },

    orderUpdate : function(lid, oid, params, next) {

        if(Object.keys(params).length === 0) {
            return q(false);
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

        var self = this;
        return query("UPDATE funch.orders SET " + setClause + ", ordertime = NOW() WHERE id = ? and lunchId = ?", queryValues).then(function (res) {
            return self.order(lid, oid, next);
        }).catch(function (err) {
           next(err);
        });
    },

    getUserLunchDetailsForHash : function(hash, next) {

        var self = this;
        return query("SELECT userId, lunchId FROM funch.hashes WHERE hash =?", hash).then(function(results) {
            var row = filterOneRow(results);
            var userId = row['userId'];
            var lunchId = row['lunchId'];
            return self.user(userId, next).then(function(user) {
                return self.lunch(lunchId, next).then(function(lunch) {
                    return {"user" : user, "lunch": lunch};
                });
            });
        }).catch(function (err) {
            next(err);
        });

    },

    generateHashForUserLunchDetails : function(userId, lunchId, next) {

        var hash = secure.getHashForUserLunch(userId, lunchId);
        return query("INSERT INTO funch.hashes (userId, lunchId, hash) VALUES(?,?,?)", [userId, lunchId, hash]).then(function(result) {
            return {"hash":hash};
        }).catch(function (err) {
            next(err);
        });

    },

    restaurantVote : function(rid, next) {

        return query("SELECT COALESCE(SUM(upvote),0) AS upvotes, COALESCE(SUM(downvote),0) as downvotes FROM funch.votes WHERE restaurantId =? LIMIT 1;", [rid]).then(function (result) {
            return filterOneRow(result);
        }).catch(function (err) {
            next(err);
        });

    },

    userVote : function(rid, uid, next) {

        return query("SELECT * FROM funch.votes WHERE userId =? AND restaurantId =? LIMIT 1;", [uid, rid]).then(function (result) {
            convertTinyIntToBool(result, 'upvote');
            convertTinyIntToBool(result, 'downvote');
            return filterOneRow(result);
        }).catch(function (err) {
            next(err);
        });

    },

    upvote : function(rid, uid, next) {

        var self = this;
        return query("INSERT INTO funch.votes (userId, restaurantId, upvote, downvote) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE upvote = ?, downvote = ?;", [uid, rid, 1, 0, 1, 0]).then(function (result) {
            return self.userVote(rid, uid, next);
        }).catch(function (err) {
            next(err);
        });

    },

    downvote : function(rid, uid, next) {

        var self = this;
        return query("INSERT INTO funch.votes (userId, restaurantId, upvote, downvote) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE upvote = ?, downvote = ?;", [uid, rid, 0, 1, 0, 1]).then(function (result) {
            return self.userVote(rid, uid, next);
        }).catch(function (err) {
            next(err);
        });

    }

}
