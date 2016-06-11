var express = require('express');
var router = express.Router();

var db = require('../db.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/hello', function(req, res, next) {
  res.send({hello: 'world'});
});

router.post('/upload', function(req, res, next) {
  db.fixtures(req.body, function(err) {
    if (err) {
      console.error(err);
      res.status(400).send(err);
    } else {
      res.send('Database write success');
    }
  });
});

router.post('/clean', function(req, res, next) {
  db.clean(['people', 'posts', 'users'], function(err) {
    if (err) {
      console.error(err);
      res.status(400).send(err);
    } else {
      res.send('Database clean success');
    }
  });
});

module.exports = router;
