'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const jwt = require('jsonwebtoken');
const PassportConfig = require('../configs/passport-config');
const Account = require('../models/account');

const router = express.Router();

/**
 * 로그인
 */
router.post('/v1/users', async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const password = req.body.password;
  
    const account = await Account.findOne({
      accountId: userId,
      password: password,
    });
  
    // userId와 password가 일치하는 사용자 존재 여부 확인
    if (account) {
      // 데이터 가공
      const payload = {};
      payload.user = { userId: userId };                                  // 사용자 정보
      payload.token = jwt.sign(payload.user, PassportConfig.JWT_SECRET);  // 토큰
  
      res.json(payload);
    } else {
      throw createError(HttpConfig.UNAUTHORIZED.statusCode, HttpConfig.UNAUTHORIZED.message);
    }
  } catch(err) {
    next(err);
  }
});

module.exports = router;
