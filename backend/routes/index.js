var express = require('express');
var db = require("../db");

var router = express.Router();

// ------ RESTAURANTS

// GET

router.get('/api/restaurants', function(req, res, next) {
  db.restaurants(function(results) {
    res.json(results);
  }, next);
});

router.get('/api/restaurants/:id(\\d+)', function(req, res, next) {
  db.restaurant(req.params.id, function(results) {
    res.json(results);
  }, next);
});

router.get('/api/restaurants/favorites', function(req, res, next) {
  db.restaurantFavorites(function(results) {
    res.json(results);
  }, next);
});

// PUT

router.put('/api/restaurants/:id', function(req, res, next) {
  db.restaurantUpdate(req.params.id, req.body, function(result) {
    res.json(result);
  }, next);
});

// ------ LUNCHES

// GET

router.get('/api/lunch/active', function(req, res, next) {
  db.lunchActive(function(result) {
    res.json(result);
  }, next);
});

router.get('/api/lunch/:id(\\d+)', function(req, res, next) {
  db.lunch(req.params.id, function(results) {
    res.json(results);
  }, next);
});

// DELETE

router.delete('/api/lunch/:id(\\d+)', function(req, res, next) {
  db.lunchDelete(req.params.id, function(result) {
    res.json(result);
  }, next);
});

// POST

router.post('/api/lunch', function(req, res, next) {
  var restaurantId = req.body.restaurantId;
  var stoptime = req.body.stoptime;
  var notes = req.body.notes;
  var onduty = Array.isArray(req.body.onduty) ? req.body.onduty : JSON.parse(req.body.onduty);
  db.lunchAdd(restaurantId, stoptime, notes, onduty, function(result) {
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


// ------ USERS

// GET

router.get('/api/user', function(req, res, next) {
  db.users(function(results) {
    res.json(results);
  }, next);
});

router.get('/api/user/:id(\\d+)', function(req, res, next) {
  db.user(req.params.id, function(results) {
    res.json(results);
  }, next);
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

router.get('/api/user/:uid(\\d+)/restaurants/:rid(\\d+)/recommendations', function(req, res, next) {
  db.recommendations(req.params.uid, req.params.rid, function(results) {
    res.json(results);
  }, next);
});

// ------ QUICK PICKS

router.get('/api/restaurants/:rid(\\d+)/quickpicks', function(req, res, next) {
  db.quickpicks(req.params.rid, function(results) {
    res.json(results);
  }, next);
});

////////////////////////

router.get('/api/sessions', function(req, res) {
  db.sessions(function(results) {
    res.json({ sessions: results });
  });
});

module.exports = router;
