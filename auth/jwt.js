var jwt = require('jsonwebtoken');
var expressJWT = require('express-jwt');
var auth = expressJWT({
    secret: 'SECRET',
    userProperty: 'payload'
});

exports.auth = auth;

exports.generateToken = function(user) {
  return jwt.sign({
    id: user.id
  }, 'SECRET');
}
