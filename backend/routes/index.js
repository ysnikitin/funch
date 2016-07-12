var express = require('express');
var db = require("../db");
var router = express.Router();

router.get('/api/daemon', function(req, res) {
  res.json({ "Daemon": "Matt Damon" });
});

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
