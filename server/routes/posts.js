var express = require('express');
var router = express.Router();
var jwt = require('../auth/jwt.js');
var utils = require('../utils.js');

var db = require('../db.js');

router.get('/', function(req, res, next) {
  db.get().query('SELECT * FROM posts', function(err, rows) {
    if (err) return utils.error(res, err);
    res.send(rows);
  });
});

router.get('/:id', function(req, res, next) {
  db.get().query('SELECT * FROM posts WHERE id="' + req.params.id + '"', function(err, rows) {
    if (err) return utils.error(res, err);
    res.send(rows[0]);
  });
});

router.post('/', jwt.auth, function(req, res, next) {
  console.log('Trying to submit post from user id=' + req.payload.id);
  db.get().query('SELECT categories FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');

    // Prevent user stupidity
    var verified = [];
    for (var i = 0; i < req.body.length; i++) {
      var o = req.body[i];
      // Verify all fields are present
      if (!o.title || !o.content || !o.category) {
        console.log('Detected item that is missing field');
        continue;
      }
      // Verify user belongs to the category they are posting to
      console.log(rows[0].categories.split(','));
      console.log(rows[0].categories.split(',').length);
      if (rows[0].categories.split(',').indexOf('' + o.category) == -1) { // TODO make rows.categories split into number
        console.log('Skipping item because category mismatch');
        continue;
      }
      // Extract only the fields that are needed
      var v = {
        title: o.title,
        content: o.content,
        author: req.payload.id,
        category: o.category
      };
      verified.push(v);
    }

    console.log('Adding ' + verified.length + ' posts to database');

    // Write to database
    db.fixtures.create({
      tables: {
        posts: verified
      }
    }, function(err) {
      if (err) return utils.error(res, err);
      res.send('Database write success');
    });

  });
});

router.patch('/', jwt.auth, function(req, res, next) {

  db.get().query('SELECT categories FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');

    // Prevent user stupidity round 1
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

      // Prevent user stupidity round 2
      var verified = [];
      for (var i = 0; i < rows.length; i++) {
        // Verify user belongs to the category they are posting to
        if (currentUser.categories.split(',').indexOf(rows[i].category) == -1) {
          continue;
        }
        // Extract stuff from request body
        var o = hasIds[rows[i].id];
        var v = {
          id: o.id
        };
        if (o.title) v.title = o.title;
        if (o.content) v.content = o.content;
        verified.push(v);
      }

      // Write to database
      db.fixtures.update({
        tables: {
          posts: updates
        }
      }, function(err) {
        if (err) return utils.error(res, err);
        res.send('Database write success');
      });

    });
  });
});

router.patch('/:id', jwt.auth, function(req, res, next) {

  db.get().query('SELECT categories FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');

    var currentUser = rows[0];
    db.get().query('SELECT id, category FROM posts WHERE id="' + req.params.id + '"', function(err, rows) {

      if (err) return utils.error(res, err);

      if (!rows[0]) return res.status(404).send('Post not found');
      if (currentUser.categories.split(',').indexOf(rows[0].category) == -1) {
        return res.status(401).send('You are not authorized to modify this post.');
      }

      var o = req.body;
      var v = {
        id: req.params.id
      };
      if (o.title) v.title = o.title;
      if (o.content) v.content = o.content;

      // Write to database
      db.fixtures.update({
        tables: {
          posts: [v]
        }
      }, function(err) {
        if (err) return utils.error(res, err);
        res.send('Database write success');
      });

    });
  });
});

router.delete('/', jwt.auth, function(req, res, next) {

  db.get().query('SELECT categories FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');

    // Verify that user is post author
    var currentUser = rows[0];
    db.get().query('SELECT id, category FROM posts WHERE id IN (' + req.body.join(',') + ')', function(err, rows) {

      if (err) return utils.error(res, err);

      var verified = []
      for (var i = 0; i < rows.length; i++) {
        if (currentUser.categories.split(',').indexOf(rows[i].category) == -1) {
          continue;
        }
        verified.push(rows[i].id);
      }

      // Write to database
      db.get().query('DELETE FROM posts WHERE id IN (' + verified.join(',') + ')', function(err, rows) {
        if (err) return utils.error(res, err);
        res.send('Database write success');
      });

    });
  });
});

router.delete('/:id', jwt.auth, function(req, res, next) {

  db.get().query('SELECT categories FROM users WHERE id="' + req.payload.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);
    if (!rows[0]) return res.status(404).send('User not found');

    var currentUser = rows[0];
    db.get().query('SELECT id, category FROM posts WHERE id="' + req.params.id + '"', function(err, rows) {

      if (err) return utils.error(res, err);

      if (!rows[0]) return res.status(404).send('Post not found');
      if (currentUser.categories.split(',').indexOf(rows[0].category) == -1) {
        return res.status(401).send('You are not authorized to modify this post.');
      }

      // Write to database
      db.get().query('DELETE FROM posts WHERE id="' + req.params.id + '"', function(err, rows) {
        if (err) return utils.error(res, err);
        res.send('Database write success');
      });

    });
  });
});

module.exports = router;
