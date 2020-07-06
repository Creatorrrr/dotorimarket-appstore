'use strict';

const createError = require('http-errors');
const express = require('express');
const router = express.Router();
const HttpConfig = require('../configs/http-config');
const FileConfig = require('../configs/file-config');

router.get('/:osType', function(req, res, next) { // ************** querystring으로 jwt 인증
  const osType = req.params.osType;
  if (osType == 'android') {
    res.download(`${FileConfig.FILE_PATH}/dotori-android.apk`);
  } else if (osType == 'ios') {
    res.download(`${FileConfig.FILE_PATH}/dotori-ios.ipa`);
  } else {
    createError(HttpConfig.FILE_NOT_FOUND.statusCode, HttpConfig.FILE_NOT_FOUND.message);
  }
});

module.exports = router;
