'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const getFaqModel = require('../models/faq');

const router = express.Router();

/**
 * 자주 묻는 질문 생성
 */
router.post('/v1/faqs', async (req, res, next) => {
  try {
    const Faq = await getFaqModel();
    const faq = new Faq({
      title: req.body.title,
      content: req.body.content,
    });

    const result = await faq.save();

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 자주 묻는 질문 수정
 */
router.patch('/v1/faqs/:faqId', async (req, res, next) => {
  try {
    const faqId = req.params.faqId;
    const faq = {};
    if (req.body.title) faq.title = req.body.title;
    if (req.body.content) faq.content = req.body.content;

    const Faq = await getFaqModel();
    const result = await Faq.updateOne({ _id: faqId }, faq);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 자주 묻는 질문 삭제
 */
router.delete('/v1/faqs/:faqId', async (req, res, next) => {
  try {
    const faqId = req.params.faqId;

    const Faq = await getFaqModel();
    const result = await Faq.deleteOne({ _id: faqId });

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 자주 묻는 질문 단건 조회
 */
router.get('/v1/faqs/:faqId', async (req, res, next) => {
  try {
    const faqId = req.params.faqId;

    // 조회
    const Faq = await getFaqModel();
    const faq = await Faq.findOne({
      faqId: faqId,
    });

    // 데이터 가공
    const payload = faq ? {
      id: faq._id,
      title: faq.title,
      content: faq.content,
      createdAt: faq.createdAt,
      updatedAt: faq.updatedAt,
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
 * 자주 묻는 질문 리스트 조회
 */
router.get('/v1/faqs', async (req, res, next) => {
  try {
    const filter = JSON.parse(req.query.filter || null);
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    const Faq = await getFaqModel();
    let faqs = Faq.find( filter );                                      // 필터
    if (field) faqs = faqs.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) faqs = faqs.sort(orders);                               // 정렬
    if (paging) faqs = faqs.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    faqs = await faqs;

    // 데이터 가공
    const payload = [];
    for (let faq of faqs) {
      payload.push({
        id: faq._id,
        title: faq.title,
        content: faq.content,
        createdAt: faq.createdAt,
        updatedAt: faq.updatedAt,
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
