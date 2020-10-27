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
    console.log("111");

    const userId = req.body.userId;
    const password = req.body.password;
    console.log(`userId = ${userId}`);

    console.log(`password = ${password}`);

    const Account = await getAccountModel();
    console.log("222");
    const account = await Account.findOne({
      accountId: userId,
      password: password,
    });

    console.log("3333");

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
