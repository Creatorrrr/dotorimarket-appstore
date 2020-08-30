'use strict';

const express = require('express');
const router = express.Router();
const FileConfig = require('../configs/file-config');

router.get('/v1/apps/:fileName', function(req, res, next) { // ************** querystring으로 jwt 인증
  const fileName = req.params.fileName;
  res.download(`${FileConfig.FILE_PATH}/${fileName}`);
});

module.exports = router;
