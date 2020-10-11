'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const getApplicationModel = require('../models/application');

const router = express.Router();

/**
 * 앱 생성
 */
router.post('/v1/applications', async (req, res, next) => {
  try {
    const Application = await getApplicationModel();
    const application = new Application({
      name: req.body.name,
      version: req.body.version,
    });

    const result = await application.save();

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 앱 수정
 */
router.patch('/v1/applications/:applicationId', async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId;
    const application = {
      name: req.body.name,
      version: req.body.version,
    };

    const Application = await getApplicationModel();
    const result = await Application.updateOne({ applicationId }, application);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 앱 삭제
 */
router.delete('/v1/applications/:applicationId', async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId;

    const Application = await getApplicationModel();
    const result = await Application.deleteOne({ applicationId });

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 앱 단건 조회
 */
router.get('/v1/applications/:applicationId', async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId;

    // 조회
    const Application = await getApplicationModel();
    const application = await Application.findOne({
      applicationId: applicationId,
    });

    // 데이터 가공
    const payload = application ? {
      applicationId: application.applicationId,
      name: application.name,
      version: application.version,
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
 * 앱 리스트 조회
 */
router.get('/v1/applications', async (req, res, next) => {
  try {
    const filter = JSON.parse(req.query.filter || null);
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    const Application = await getApplicationModel();
    let applications = Application.find( filter );                                      // 필터
    if (field) applications = applications.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) applications = applications.sort(orders);                               // 정렬
    if (paging) applications = applications.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    applications = await applications;

    // 데이터 가공
    const payload = [];
    for (let application of applications) {
      payload.push({
        applicationId: application.applicationId,
        name: application.name,
        version: application.version,
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
