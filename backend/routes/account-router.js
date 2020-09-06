'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const { logger } = require('../configs/logger-config');
const getAccountModel = require('../models/account');

const router = express.Router();

/**
 * 계정 생성
 */
router.post('/v1/accounts', async (req, res, next) => {
  try {
    const Account = await getAccountModel();
    const account = new Account({
      accountId: req.body.accountId,
      password: req.body.password,
      name: req.body.password,
      email: req.body.email,
    });

    const result = await account.save();

    res.json({ result });
  } catch(err) {
    logger.error(err)
    next(err);
  }
});

/**
 * 계정 수정
 */
router.patch('/v1/accounts/:accountId', async (req, res, next) => {
  try {
    const accountId = req.params.accountId;
    const account = {
      password: req.body.password,
      name: req.body.password,
      email: req.body.email,
    };

    const Account = await getAccountModel();
    const result = await Account.updateOne({ accountId }, account);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 계정 삭제
 */
router.delete('/v1/accounts/:accountId', async (req, res, next) => {
  try {
    const accountId = req.params.accountId;

    const Account = await getAccountModel();
    const result = await Account.deleteOne({ accountId });

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 계정 단건 조회
 */
router.get('/v1/accounts/:accountId', async (req, res, next) => {
  try {
    const accountId = req.params.accountId;

    // 조회
    const Account = await getAccountModel();
    const account = await Account.findOne({
      accountId: accountId,
    });

    // 데이터 가공
    const payload = {
      accountId: account.accountId,
      name: account.name,
      email: account.email,
    };

    res.json({
      statusCode: HttpConfig.SUCCESS.statusCode,
      message: HttpConfig.SUCCESS.message,
      result: payload,
    });
  } catch(err) {
    next(err);
  }
});

/**
 * 계정 리스트 조회
 */
router.get('/v1/accounts', async (req, res, next) => {
  try {
    const filter = JSON.parse(req.query.filter || null);
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    const Account = await getAccountModel();
    let accounts = Account.find( filter );                                      // 필터
    if (field) accounts = accounts.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) accounts = accounts.sort(orders);                               // 정렬
    if (paging) accounts = accounts.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    accounts = await accounts;

    // 데이터 가공
    const payload = [];
    for (let account of accounts) {
      payload.push({
        accountId: account.accountId,
        name: account.name,
        email: account.email,
      });
    }

    res.json({
      statusCode: HttpConfig.SUCCESS.statusCode,
      message: HttpConfig.SUCCESS.message,
      result: payload,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
