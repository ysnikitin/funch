var express = require('express');
var db = require("../db");

var router = express.Router();

// ------ RESTAURANTS

// GET

router.get('/api/restaurants', function(req, res, next) {
  db.restaurants(next).then(res.json.bind(res));
});

router.get('/api/restaurants/:id(\\d+)', function(req, res, next) {
  db.restaurant(req.params.id, next).then(res.json.bind(res));
});

router.get('/api/restaurants/favorites', function(req, res, next) {
  db.restaurantFavorites(next).then(res.json.bind(res));
});

// DELETE

router.delete('/api/restaurants/:id(\\d+)', function(req, res, next) {
  db.restaurantDelete(req.params.id, next).then(res.json.bind(res));
});

// POST

router.post('/api/restaurants/', function(req, res, next) {
  var name = req.body.name;
  var address = req.body.address;
  var phone = req.body.phone;
  var menu = req.body.menu;
  var yelpURL = req.body.yelpURL;
  db.restaurantInsert(name, address, phone, menu, yelpURL, next).then(res.json.bind(res));
});

// PUT

router.put('/api/restaurants/:id', function(req, res, next) {
  db.restaurantUpdate(req.params.id, req.body, next).then(res.json.bind(res));
});

// ------ LUNCHES

// GET

router.get('/api/lunch/active', function(req, res, next) {
  db.lunchActive(next).then(res.json.bind(res));
});

router.get('/api/lunch', function(req, res, next) {
  db.lunches(next).then(res.json.bind(res));
});

router.get('/api/lunch/:id(\\d+)', function(req, res, next) {
  db.lunch(req.params.id, next).then(res.json.bind(res));
});

// DELETE

router.delete('/api/lunch/:id(\\d+)', function(req, res, next) {
  db.lunchDelete(req.params.id, next).then(res.json.bind(res));
});

// POST

router.post('/api/lunch', function(req, res, next) {
  var restaurantId = req.body.restaurantId;
  var stoptime = req.body.stoptime;
  var notes = req.body.notes;
  var limit = req.body.limit;
  var onduty = Array.isArray(req.body.onduty) ? req.body.onduty : JSON.parse(req.body.onduty);
  db.lunchAdd(restaurantId, stoptime, notes, onduty, limit, function(result) {
    res.json(result);
  }, next);
});

router.post('/api/lunch/:id(\\d+)/email', function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var initials = req.body.initials;
  db.lunchEmail(req.params.id, name, email, initials, function(result) {
    res.json(result);
  }, next);
});

// PUT

router.put('/api/lunch/:id', function(req, res, next) {
  db.lunchUpdate(req.params.id, req.body, next).then(res.json.bind(res));
});

// ------ USERS

// GET

router.get('/api/user', function(req, res, next) {
  db.users(function(results) {
    res.json(results);
  }, next);
});

router.get('/api/user/:id(\\d+)', function(req, res, next) {
  db.user(req.params.id, next).then(res.json.bind(res));
});

// POST

router.post('/api/user', function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var perm = req.body.perm;
  var initials = req.body.initials;
  db.usersAdd(name, email, perm, initials, function(result) {
    res.json(result);
  }, next);
});

// ------ RECOMMENDATIONS

// GET

router.get('/api/user/:uid(\\d+)/restaurants/:rid(\\d+)/recommendations', function(req, res, next) {
  db.recommendations(req.params.uid, req.params.rid, function(results) {
    res.json(results);
  }, next);
});

// ------ QUICK PICKS

// GET

router.get('/api/restaurants/:rid(\\d+)/quickpicks', function(req, res, next) {
  db.quickpicks(req.params.rid, function(results) {
    res.json(results);
  }, next);
});

// ------ ORDERS

// GET

router.get('/api/lunch/:id(\\d+)/orders', function(req, res, next) {
  db.orders(req.params.id, function(results) {
    res.json(results);
  }, next);
});

router.get('/api/lunch/:lid(\\d+)/orders/:oid(\\d+)', function(req, res, next) {
  db.order(req.params.lid, req.params.oid, function(results) {
    res.json(results);
  }, next);
});

// DELETE

router.delete('/api/lunch/:lid(\\d+)/orders/:oid(\\d+)', function(req, res, next) {
  db.orderDelete(req.params.lid, req.params.oid, function(result) {
    res.json(result);
  }, next);
});

// POST

router.post('/api/lunch/:id(\\d+)/orders', function(req, res, next) {
  db.ordersInsert(req.params.id, req.body, function(results) {
    res.json(results);
  }, next);
});

// PUT

router.put('/api/lunch/:lid/orders/:oid(\\d+)', function(req, res, next) {
  db.orderUpdate(req.params.lid, req.params.oid, req.body, function(result) {
    res.json(result);
  }, next);
});

// ------ HASHES

router.get('/api/hash/:hash', function(req, res, next) {
  db.getUserLunchDetailsForHash(req.params.hash, next).then(res.json.bind(res));
});

router.get('/api/lunch/:lid(\\d+)/user/:uid(\\d+)/hash', function(req, res, next) {
  db.generateHashForUserLunchDetails(req.params.uid, req.params.lid, next).then(res.json.bind(res));
});

// ------ VOTES

router.get('/api/restaurants/:rid(\\d+)/user/:uid(\\d+)', function(req, res, next) {
  db.userVote(req.params.rid, req.params.uid, next).then(res.json.bind(res));
});

router.put('/api/restaurants/:rid(\\d+)/user/:uid(\\d+)/upvote', function(req, res, next) {
  db.upvote(req.params.rid, req.params.uid, function(result) {
    res.json(result);
  }, next);
});

router.put('/api/restaurants/:rid(\\d+)/user/:uid(\\d+)/downvote', function(req, res, next) {
  db.downvote(req.params.rid, req.params.uid, function(result) {
    res.json(result);
  }, next);
});


////////////////////////

module.exports = router;
