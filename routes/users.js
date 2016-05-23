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

module.exports = router;
