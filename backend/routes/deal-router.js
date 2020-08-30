'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const Deal = require('../models/deal');

const router = express.Router();

/**
 * 거래 생성
 */
router.post('/v1/deals', async (req, res, next) => {
  const deal = new Deal({
    title: req.body.title,
    categoryId: req.body.categoryId,
    description: req.body.description,
    type: req.body.type,
  });

  try {
    const result = await deal.save();

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 거래 수정
 */
router.patch('/v1/deals/:dealId', async (req, res, next) => {
  try {
    const dealId = req.params.dealId;
    const deal = {
      title: req.body.title,
      categoryId: req.body.categoryId,
      description: req.body.description,
      type: req.body.type,
    };

    const result = await Deal.updateOne({ dealId }, deal);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 거래 삭제
 */
router.delete('/v1/deals/:dealId', async (req, res, next) => {
  try {
    const dealId = req.params.dealId;

    const result = await Deal.deleteOne({ dealId });

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 거래 단건 조회
 */
router.get('/v1/deals/:dealId', async (req, res, next) => {
  try {
    const dealId = req.params.dealId;

    // 조회
    const deal = await Deal.findOne({
      dealId: dealId,
    });

    // 데이터 가공
    const payload = {
      dealId: deal.dealId,
      title: deal.title,
      categoryId: deal.categoryId,
      description: deal.description,
      type: deal.type,
    };

    res.json(payload);
  } catch(err) {
    next(err);
  }
});

/**
 * 거래 리스트 조회
 */
router.get('/v1/deals', async (req, res, next) => {
  try {
    const filter = JSON.parse(req.query.filter || null);
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    let deals = Deal.find( filter );                                      // 필터
    if (field) deals = deals.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) deals = deals.sort(orders);                               // 정렬
    if (paging) deals = deals.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    deals = await deals;

    // 데이터 가공
    const payload = [];
    for (let deal of deals) {
      payload.push({
        dealId: deal.dealId,
        title: deal.title,
        categoryId: deal.categoryId,
        description: deal.description,
        type: deal.type,
      });
    }

    res.json(payload);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
