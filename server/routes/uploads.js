var express = require('express');
var router = express.Router();
var jwt = require('../auth/jwt.js');
var utils = require('../utils.js');

var fs = require('fs');
var request = require('request');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});

router.post('/images', upload.single('foo_bar_test_upload'), function(req, res, next) {

  console.log('Received image upload request');

  console.log(req.body);
  console.log(req.file);

  var queryParams = {
    key: 'ARAo69nQQQ0ynxVo1G2LDz',
    mimetype: req.file.mimetype,
    filename: req.file.originalname
  };

  var formData = {
    fileUpload: fs.createReadStream(req.file.destination + req.file.filename)
  };

  request.post({
    url: 'https://www.filestackapi.com/api/store/S3',
    qs: queryParams,
    formData: formData
  }, function(err, httpResponse, body) {
    if (err) return utils.error(res, err);
    fs.unlinkSync(req.file.destination + req.file.filename);
    res.send({link: JSON.parse(body).url});
  });
});

module.exports = router;
