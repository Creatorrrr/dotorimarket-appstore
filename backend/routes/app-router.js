'use strict';

const createError = require('http-errors');
const express = require('express');
const router = express.Router();
const HttpConfig = require('../configs/http-config');
const FileConfig = require('../configs/file-config');

router.get('/v1/apps/:fileName', function(req, res, next) { // ************** querystring으로 jwt 인증
  const fileName = req.params.fileName;
  res.download(`${FileConfig.FILE_PATH}/${fileName}`);
});

router.post('/v1/apps/', function(req, res, next) { // ************** querystring으로 jwt 인증
  const ios = req.files.ios;
  const android = req.files.android;

  if (ios) {
    ios.mv(
      `${FileConfig.FILE_PATH}/dotori-ios.ipa`,
      (err) => {
        if (err) throw createError(HttpConfig.INTERNAL_SERVER_ERROR.statusCode, `${HttpConfig.INTERNAL_SERVER_ERROR.message} (에러정보: ${err})`);
      }
    );
  }

  if (android) {
    android.mv(
      `${FileConfig.FILE_PATH}/dotori-android.apk`,
      (err) => {
        if (err) throw createError(HttpConfig.INTERNAL_SERVER_ERROR.statusCode, `${HttpConfig.INTERNAL_SERVER_ERROR.message} (에러정보: ${err})`);
      }
    );
  }

  res.json({
    statusCode: HttpConfig.OK.statusCode,
    message: HttpConfig.OK.message,
  });
});

module.exports = router;
