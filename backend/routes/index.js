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
  db.updateRestaurant(req.params.id, req.body, function(result) {
    res.json(result);
  }, next);
});

// ------ LUNCHES

// GET

router.get('/api/lunch/:id(\\d+)', function(req, res, next) {
  db.lunch(req.params.id, function(results) {
    res.json(results);
  }, next);
});

////////////////////////

router.post('/api/newSession', function(req, res) {
  var location = req.body.location;
  var menuUrl = req.body.menuUrl;
  var notes = req.body.notes;
  db.newSession(location, menuUrl, notes, function(id) {
    res.json({ id: id });
  });
});

router.get('/api/sessions', function(req, res) {
  db.sessions(function(results) {
    res.json({ sessions: results });
  });
});

module.exports = router;
