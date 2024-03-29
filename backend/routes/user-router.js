"use strict";

const createError = require("http-errors");
const HttpConfig = require("../configs/http-config");
const express = require("express");
const jwt = require("jsonwebtoken");
const PassportConfig = require("../configs/passport-config");
const getAccountModel = require("../models/account");
const { logger } = require("../configs/logger-config");

const router = express.Router();

/**
 * 로그인
 */
router.post("/v1/users", async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const password = req.body.password;

    const Account = await getAccountModel();
    const account = await Account.findOne({
      accountId: userId,
      password: password,
    });

    // userId와 password가 일치하는 사용자 존재 여부 확인
    if (account) {
      // 데이터 가공
      const token = jwt.sign({ id: account._id }, PassportConfig.JWT_SECRET); // 토큰
      const payload = {
        account: {
          id: account._id,
          accountId: account.accountId,
          password: account.password,
          name: account.name,
          email: account.email,
          place: account.place,
          img: account.img,
          thumbnail: account.thumbnail,
        },
        token,
      };

      res.json({
        statusCode: HttpConfig.OK.statusCode,
        message: HttpConfig.OK.message,
        result: payload,
      });
    } else {
      throw createError(
        HttpConfig.UNAUTHORIZED.statusCode,
        HttpConfig.UNAUTHORIZED.message
      );
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
