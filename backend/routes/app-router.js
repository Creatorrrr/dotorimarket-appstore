'use strict';

const express = require('express');
const router = express.Router();
const FileConfig = require('../configs/file-config');

router.get('/:osType', function(req, res, next) { // ************** querystring으로 jwt 인증
  const osType = req.params.osType;
  res.download(`${FileConfig.FILE_PATH}/${osType}`);
});

module.exports = router;
