var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');

var db = require('../db.js');

passport.serializeUser(function(user, callback) {
  callback(null, user.id);
});

passport.deserializeUser(function(id, callback) {
  db.get().query('SELECT * FROM users WHERE id="' + id + '"', function(err, rows) {
    callback(err, rows[0]);
  });
});

passport.use('local', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, callback) {
    db.get().query('SELECT * FROM users WHERE username="' + username + '"', function(err, rows) {
      if (err) return callback(err);
      if (!rows.length) return callback(null, null);
      if (!bcrypt.compareSync(password, rows[0].password)) {
        return callback(null, null);
      } else {
        return callback(null, rows[0]);
      }
    });
  }
));
