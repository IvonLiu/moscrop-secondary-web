var mysql = require('mysql');
var async = require('async');
var config = require('./config.json');

var PRODUCTION_DB = 'moscrop_app_prod';
var TEST_DB = 'moscrop_app_prod'; // this isn't really used at all

exports.MODE_PRODUCTION = 'mode_production';
exports.MODE_TEST = 'mode_test';

var state = {
  pool: null,
  mode: null
};

exports.connect = function(mode, callback) {
  state.pool = mysql.createPool({
    host: config.host,
    user: config.username,
    password: config.password,
    database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
  });
  state.mode = mode;

  // Create tables if they don't exist
  async.parallel([
    function(callback) {
      state.pool.query(
        'CREATE TABLE IF NOT EXISTS posts ('
        + 'id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, '
        + 'title VARCHAR(255), '
        + 'content TEXT, '
        + 'author INT(11) NOT NULL, '
        + 'category INT(11) NOT NULL, '
        + 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL'
        + ')', callback);
    },
    function(callback) {
      state.pool.query(
        'CREATE TABLE IF NOT EXISTS users ('
        + 'id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, '
        + 'username VARCHAR(100) UNIQUE NOT NULL, '
        + 'password VARCHAR(100) NOT NULL, '
        + 'first_name VARCHAR(100) NOT NULL, '
        + 'last_name VARCHAR(100) NOT NULL, '
        + 'student_number INT NOT NULL, '
        + 'is_moderator BOOL DEFAULT 0 NOT NULL, '
        + 'categories TEXT DEFAULT "" NOT NULL'
        + ')', callback);
    },
    function(callback) {
      state.pool.query(
        'CREATE TABLE IF NOT EXISTS categories ('
        + 'id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, '
        + 'name VARCHAR(100) UNIQUE NOT NULL'
        + ')', callback);
    }
  ], function(err, results) {
    if (err) return callback(err);
    callback();
  });
};

exports.get = function() {
  return state.pool;
};

exports.fixtures = {};

exports.fixtures.create = function(data, callback) {
  var pool = state.pool;
  if (!pool) return callback(new Error('Missing database connection.'));

  var names = Object.keys(data.tables);
  async.each(names, function(name, callback) {
    async.each(data.tables[name], function(row, callback) {
      var keys = Object.keys(row);
      var values = keys.map(function(key) {
        return "'" + row[key] + "'"
      });
      pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES (' + values.join(',') + ')', callback);
    }, callback);
  }, callback);
};

exports.fixtures.update = function(data, callback) {
  var pool = state.pool;
  if (!pool) return callback(new Error('Missing database connection.'));

  var names = Object.keys(data.tables);
  async.each(names, function(name, callback) {
    async.each(data.tables[name], function(row, callback) {
      var id = row.id;
      if (!id) {
        return callback(new Error('Missing id field'));
      }
      delete row.id;
      var keys = Object.keys(row);
      var updates = keys.map(function(key) {
        return key + '="' + row[key] + '"'
      });
      pool.query('UPDATE ' + name + ' SET ' + updates.join(',') + ' WHERE id="' + id + '"', callback);
      //pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES (' + values.join(',') + ')', callback);
    }, callback);
  }, callback);
};

exports.clean = function(tables, callback) {
  var pool = state.pool;
  if (!pool) return callback(new Error('Missing database connection.'));

  async.each(tables, function(name, callback) {
    pool.query('DELETE FROM ' + name, callback);
  }, callback);
}
