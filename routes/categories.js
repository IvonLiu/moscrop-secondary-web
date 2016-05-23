var express = require('express');
var router = express.Router();
var jwt = require('../auth/jwt.js');
var utils = require('../utils.js');

var db = require('../db.js');

router.get('/', function(req, res, next) {
  db.get().query('SELECT * FROM categories', function(err, rows) {
    if (err) return utils.error(res, err);
    res.send(rows);
  });
});

router.get('/:id', function(req, res, next) {
  db.get().query('SELECT * FROM categories WHERE id="' + req.params.id + '"', function(err, rows) {
    if (err) return utils.error(res, err);
    res.send(rows[0]);
  });
});

router.post('/', jwt.auth, function(req, res, next) {

  // Retrieve the user that made the request
  db.get().query('SELECT is_moderator FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');
    if (!rows[0].is_moderator) return res.status(401).send('Access denied');

    var verified = [];
    for (var i = 0; i < req.body.length; i++) {
      var o = req.body[i];
      if (!o.name) continue;
      var v = {
        name: o.name
      };
      verified.push(v);
    }

    db.fixtures.create({
      tables: {
        categories: verified
      }
    }, function(err) {
      if (err) return utils.error(res, err);
      res.send('Database write success');
    });

  });
});

router.patch('/', jwt.auth, function(req, res, next) {

  // Retrieve the user that made the request
  db.get().query('SELECT is_moderator FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');
    if (!rows[0].is_moderator) return res.status(401).send('Access denied');

    // Prevent user stupidity
    var hasIds = [];
    for (var i = 0; i < req.body.length; i++) {
      var o = req.body[i];
      // Verify all fields are present
      if (!o.id) {
        continue;
      }
      hasIds[o.id] = o;
    }

    var ids = Object.keys(hasIds);

    var currentUser = rows[0];
    db.get().query('SELECT id, category FROM posts WHERE id IN (' + ids.join(',') + ')', function(err, rows) {

      if (err) return utils.error(err);

      var verified = [];
      for (var i = 0; i < rows.length; i++) {
        var o = hasIds[rows[i].id];
        var v = {
          id: o.id
        };
        if (o.name) v.name = o.name;
        verified.push(v);
      }

      // Write to database
      db.fixtures.update({
        tables: {
          categories: updates
        }
      }, function(err) {
        if (err) return utils.error(res, err);
        res.send('Database write success');
      });

    });
  });
});

router.patch('/:id', jwt.auth, function(req, res, next) {

  // Retrieve the user that made the request
  db.get().query('SELECT is_moderator FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');
    if (!rows[0].is_moderator) return res.status(401).send('Access denied');

    db.get().query('SELECT * FROM categories WHERE id="' + req.params.id + '"', function(err, rows) {

      if (err) return utils.error(res, err);
      if (!rows[0]) return res.status(404).send('Category not found');

      // Extract
      var o = req.body;
      var v = {
        id: req.params.id
      };
      if (o.name) v.name = o.name;

      // Write to database
      db.fixtures.update({
        tables: {
          categories: [v]
        }
      }, function(err) {
        if (err) return utils.error(res, err);
        res.send('Database write success');
      });

    });

  });
});

router.delete('/', jwt.auth, function(req, res, next) {

  // Retrieve the user that made the request
  db.get().query('SELECT * FROM users WHERE id="' + req.payload.id + '"' + function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');
    if (!rows[0].is_moderator) return res.status(401).send('Access denied');

    // Write to database
    db.get().query('DELETE FROM categories WHERE id IN (' + req.body.join(',') + ')', function(err, rows) {
      if (err) return utils.error(res, err);
      res.send('Database write success');
    });

  });
});

router.delete('/:id', jwt.auth, function(req, res, next) {

  // Retrieve the user that made the request
  db.get().query('SELECT * FROM users WHERE id="' + req.payload.id + '"' + function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');
    if (!rows[0].is_moderator) return res.status(401).send('Access denied');

    // Write to database
    db.get().query('DELETE FROM categories WHERE id="' + req.params.id + '"', function(err, rows) {
      if (err) return utils.error(res, err);
      res.send('Database write success');
    });

  });
});

module.exports = router;
