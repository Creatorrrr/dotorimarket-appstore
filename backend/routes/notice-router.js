'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const getNoticeModel = require('../models/notice');

const router = express.Router();

/**
 * 공지사항 생성
 */
router.post('/v1/notices', async (req, res, next) => {
  try {
    const Notice = await getNoticeModel();
    const notice = new Notice({
      title: req.body.title,
      type: req.body.type,
      content: req.body.content,
    });

    const result = await notice.save();

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 공지사항 수정
 */
router.patch('/v1/notices/:noticeId', async (req, res, next) => {
  try {
    const noticeId = req.params.noticeId;
    const notice = {
      title: req.body.title,
      type: req.body.type,
      content: req.body.content,
    };

    const Notice = await getNoticeModel();
    const result = await Notice.updateOne({ noticeId }, notice);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 공지사항 삭제
 */
router.delete('/v1/notices/:noticeId', async (req, res, next) => {
  try {
    const noticeId = req.params.noticeId;

    const Notice = await getNoticeModel();
    const result = await Notice.deleteOne({ noticeId });

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 공지사항 단건 조회
 */
router.get('/v1/notices/:noticeId', async (req, res, next) => {
  try {
    const noticeId = req.params.noticeId;

    // 조회
    const Notice = await getNoticeModel();
    const notice = await Notice.findOne({
      noticeId: noticeId,
    });

    // 데이터 가공
    const payload = notice ? {
      noticeId: notice.noticeId,
      title: notice.title,
      type: notice.type,
      content: notice.content,
      createdAt: notice.createdAt,
      updatedAt: notice.updatedAt,
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
 * 공지사항 리스트 조회
 */
router.get('/v1/notices', async (req, res, next) => {
  try {
    const filter = JSON.parse(req.query.filter || null);
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    const Notice = await getNoticeModel();
    let notices = Notice.find( filter );                                      // 필터
    if (field) notices = notices.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) notices = notices.sort(orders);                               // 정렬
    if (paging) notices = notices.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    notices = await notices;

    // 데이터 가공
    const payload = [];
    for (let notice of notices) {
      payload.push({
        noticeId: notice.noticeId,
        title: notice.title,
        type: notice.type,
        content: notice.content,
        createdAt: notice.createdAt,
        updatedAt: notice.updatedAt,
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
