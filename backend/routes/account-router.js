'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const sharp = require("sharp");
const { logger } = require('../configs/logger-config');
const getAccountModel = require('../models/account');

const { uploadCfg } = require("../configs/upload-config");

const router = express.Router();

/**
 * 계정 생성
 */
router.post('/v1/accounts', uploadCfg().fields([{ name: "img" }]), async (req, res, next) => {
  try {
    let reqData = JSON.parse(req.body.account);

    // 섬네일 생성
    let thumbnail;
    if (req.files) {
      const img = req.files.img[0];
      const filename = `thumb_${img.filename}`;
      const path = `${img.destination}${filename}`;
      const description = await sharp(img.path).resize(200).toFile(`${img.destination}thumb_${img.filename}`);
      thumbnail = {
        filename,
        path,
        description,
      };
    }

    const Account = await getAccountModel();
    const account = new Account({
      accountId: reqData.accountId,
      password: reqData.password,
      name: reqData.password,
      email: reqData.email,
      place: reqData.place,
      img: req.files ? req.files.img[0] : undefined,
      thumbnail: thumbnail,
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
router.patch('/v1/accounts/:accountId', uploadCfg().fields([{ name: "img" }]), async (req, res, next) => {
  try {
    const reqData = JSON.parse(req.body.account);

    // 섬네일 생성
    let thumbnail;
    if (req.files) {
      const img = req.files.img[0];
      const filename = `thumb_${img.filename}`;
      const path = `${img.destination}${filename}`;
      const description = await sharp(img.path).resize(200).toFile(`${img.destination}thumb_${img.filename}`);
      thumbnail = {
        filename,
        path,
        description,
      };
    }

    const accountId = req.params.accountId;
    const account = {};
    if (reqData.password) account.password = reqData.password;
    if (reqData.name) account.name = reqData.name;
    if (reqData.email) account.email = reqData.email;
    if (reqData.place) account.place = reqData.place;
    if (req.files) account.img = req.files.img[0];
    if (thumbnail) account.thumbnail = thumbnail;

    const Account = await getAccountModel();
    await Account.updateOne({ _id: accountId }, account);

    const found = await Account.findOne({
      _id: accountId,
    });

    const result = {
      id: found._id,
      accountId: found.accountId,
      password: found.password,
      name: found.name,
      email: found.email,
      place: found.place,
      img: found.img,
    };

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
    const result = await Account.deleteOne({ _id: accountId });

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
      _id: accountId,
    });

    // 데이터 가공
    const payload = account ? {
      id: account._id,
      accountId: account.accountId,
      name: account.name,
      email: account.email,
      place: account.place,
      img: account.img,
      thumbnail: account.thumbnail,
    } : undefined;

    res.json({
      statusCode: HttpConfig.OK.statusCode,
      message: HttpConfig.OK.message,
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
        id: account._id,
        accountId: account.accountId,
        name: account.name,
        email: account.email,
        place: account.place,
        img: account.img,
        thumbnail: account.thumbnail,
      });
    }

    res.json({
      statusCode: HttpConfig.OK.statusCode,
      message: HttpConfig.OK.message,
      result: payload,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
