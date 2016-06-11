var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');
var passport = require('passport');
var jwt = require('../auth/jwt.js');
var utils = require('../utils.js');

var db = require('../db.js');

router.post('/register', function(req, res, next) {

  if (!req.body.username || !req.body.password
      || !req.body.firstName || !req.body.lastName
      || !req.body.studentNumber) {
    return res.status(400).send('Missing username or password');
  }

  var username = req.body.username;
  var hash = bcrypt.hashSync(req.body.password);
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var studentNumber = req.body.studentNumber;

  db.get().query('SELECT * FROM users WHERE username="' + username + '"', function(err, rows) {

    if (err) return utils.error(res, err);

    if (rows.length) {
      res.status(403).send('This username has already been taken.');
    } else {
      db.get().query(
        'INSERT INTO users (username, password, first_name, last_name, student_number)'
        + 'VALUES ("' + username + '", "' + hash + '", "' + firstName + '", "' + lastName + '", "' + studentNumber + '")',
        function(err, rows) {
          if (err) return utils.error(res, err);
          db.get().query('SELECT * FROM users WHERE id="' + rows.insertId + '"', function(err, rows) {
            if (err) return utils.error(res, err);
            res.send({
              token: jwt.generateToken(rows[0])
            });
          });
        }
      );
    }

  });

});

router.post('/login', function(req, res, next) {

  if (!req.body.username || !req.body.password) {
    return res.status(400).send('Missing username or password');
  }

  var usename = req.body.username;
  var hash = bcrypt.hashSync(req.body.password);

  passport.authenticate('local', function(err, user, info) {

    if (err) return utils.error(res, err);

    if (user) {
      res.send({
        token: jwt.generateToken(user)
      });
    } else {
      return res.status(401).send('Username or password is incorrect.');
    }
  })(req, res, next);

});

router.get('/:id/categories', function(req, res, next) {

  db.get().query('SELECT categories FROM users WHERE id="' + req.params.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');

    if (rows[0].categories.length == 0) res.send([]);

    db.get().query('SELECT * FROM categories WHERE id IN (' + rows[0].categories + ')', function(err, rows) {
      if (err) return utils.error(res, err);
      res.send(rows);
    });

  });
});

router.post('/:id/categories', jwt.auth, function(req, res, next) {

  db.get().query('SELECT is_moderator FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');
    if (!rows[0].is_moderator) return res.status(401).send('Access denied');

    db.get().query('SELECT * from categories WHERE id IN (' + req.body.join(',') + ')', function(err, rows) {

      if (err) return utils.error(res, err);

      var ids = rows.map(function(row) {
        return row.id;
      });

      db.get().query('SELECT categories FROM users WHERE id="' + req.params.id + '"', function(err, rows) {

        if (err) return utils.error(res, err);
        if (!rows[0]) return res.status(404).send('User not found');

        var categories = rows[0].categories ? rows[0].categories.split(',').map(function(category) {
          return parseInt(category);
        }).concat(ids) : ids;

        // Get unique values from categories
        categories = Array.from(new Set(categories));

        var updates = {
          id: req.params.id,
          categories: categories.join(',')
        };

        db.fixtures.update({
          tables: {
            users: [updates]
          }
        }, function(err) {
          if (err) return utils.error(res, err);
          res.send('Database write success');
        });

      });
    });
  });
});

router.delete('/:id/categories', jwt.auth, function(req, res, next) {

  db.get().query('SELECT is_moderator FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');
    if (!rows[0].is_moderator) return res.status(401).send('Access denied');

    db.get().query('SELECT categories FROM users WHERE id="' + req.params.id + '"', function(err, rows) {

      if (err) return utils.error(res, err);
      if (!rows[0]) return res.status(404).send('User not found');

      var categories = rows[0].categories.split(',').map(function(category) {
        return parseInt(category);
      }).filter(function(category) {
        return req.body.indexOf(category) == -1;
      });

      var updates = {
        id: req.params.id,
        categories: categories.join(',')
      };

      db.fixtures.update({
        tables: {
          users: [updates]
        }
      }, function(err) {
        if (err) return utils.error(res, err);
        res.send('Database write success');
      });

    });
  });
});

router.get('/:id/posts', function(req, res, next) {
  db.get().query('SELECT * FROM posts WHERE author="' + req.params.id + '"', function(err, rows) {
    if (err) return utils.error(res, err);
    res.send(rows);
  });
});

module.exports = router;
