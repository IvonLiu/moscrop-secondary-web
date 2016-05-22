var express = require('express');
var router = express.Router();
var jwt = require('../auth/jwt.js');
var utils = require('../utils.js');

var db = require('../db.js');

router.get('/', function(req, res, next) {
  db.get().query('SELECT * FROM POSTS', function(err, rows) {
    if (err) return utils.error(res, err);
    res.send(rows);
  });
});

router.get('/:id', function(req, res, next) {
  db.get().query('SELECT * FROM POSTS WHERE id="' + req.params.id + '"', function(err, rows) {
    if (err) return utils.error(res, err);
    res.send(rows[0]);
  });
});

router.post('/', jwt.auth, function(req, res, next) {
  // Add in author info from auth payload
  for (var i = 0; i < req.body.length; i++) {
    req.body[i].author = req.payload.id;
  }
  // Write to database
  db.fixtures.create({
    tables: {
      posts: req.body
    }
  }, function(err) {
    if (err) return utils.error(res, err);
    res.send('Database write success');
  });
});

router.patch('/', jwt.auth, function(req, res, next) {

  // Obtain list of IDs
  var ids = [];
  for (var i = 0; i < req.body.length; i++) {
    // Ensure every array element contains ID
    if (req.body[i].id) {
      ids.push(req.body[i].id);
    } else {
      return res.status(400).send('You must specify the post id.');
    }
  }

  // Verify that user is post author
  db.get().query('SELECT author FROM posts WHERE id IN (' + ids.join(',') + ')', function(err, rows) {

    if (err) return utils.error(res, err);

    for (var i = 0; i < rows.length; i++) {
      if (rows[i] && rows[i].author != req.payload.id) {
        return res.status(401).send('You are not authorized to modify this post.');
      }
    }

    // Only update select fields
    var updates = req.body.map(function(obj) {
      var post = {};
      post.id = obj.id;
      if (obj.title) post.title = obj.title;
      if (obj.content) post.content = obj.content;
      return post;
    });

    // Write to database
    db.fixtures.update({
      tables: {
        posts: updates
      }
    }, function(err) {
      if (err) {
        console.error(err);
        res.status(400).send(err);
      } else {
        res.send('Database write success');
      }
    });

  });

});

router.patch('/:id', jwt.auth, function(req, res, next) {

  // Verify that user is post author
  db.get().query('SELECT author FROM posts WHERE id="' + req.params.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);

    if (!rows[0]) {
      return res.status(404).send('Post not found');
    } else if (rows[0].author != req.payload.id) {
      return res.status(401).send('You are not authorized to modify this post.');
    }

    // Only update select fields
    var update = {
      id: req.params.id
    };
    if (req.body.title) update.title = req.body.title;
    if (req.body.content) update.content = req.body.content;

    // Write to database
    db.fixtures.update({
      tables: {
        posts: [update]
      }
    }, function(err) {
      if (err) return utils.error(res, err);
      res.send('Database write success');
    });

  });

});

router.delete('/', jwt.auth, function(req, res, next) {

  // Verify that user is post author
  db.get().query('SELECT author FROM posts WHERE id IN (' + req.body.join(',') + ')', function(err, rows) {

    if (err) return utils.error(res, err);

    for (var i=0; i<rows.length; i++) {
      if (rows[i] && rows[i].author != req.payload.id) {
        return res.status(401).send('You are not authorized to modify this post.');
      }
    }

    // Write to database
    db.get().query('DELETE FROM posts WHERE id IN (' + req.body.join(',') + ')', function(err, rows) {
      if (err) return utils.error(res, err);
      res.send('Database write success');
    });

  });

});

router.delete('/:id', jwt.auth, function(req, res, next) {

  // Verrify that user is post author
  db.get().query('SELECT author FROM posts WHERE id="' + req.params.id + '"', function(err, rows) {

    if (err) return utils.error(res, err);

    if (!rows[0]) {
      return res.status(404).send('Post not found');
    } else if (rows[0].author != req.payload.id) {
      return res.status(401).send('You are not authorized to modify this post.');
    }

    // Write to database
    db.get().query('DELETE FROM posts WHERE id="' + req.params.id + '"', function(err, rows) {
      if (err) return utils.error(res, err);
      res.send('Database write success');
    });

  });

});

module.exports = router;
