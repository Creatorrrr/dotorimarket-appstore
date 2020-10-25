'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const getCategoryModel = require('../models/category');

const router = express.Router();

/**
 * 카테고리 생성
 */
router.post('/v1/categories', async (req, res, next) => {
  try {
    const Category = await getCategoryModel();
    const category = new Category({
      name: req.body.name,
    });

    const result = await category.save();

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 카테고리 수정
 */
router.patch('/v1/categories/:categoryId', async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const category = {
      name: req.body.name,
    };

    const Category = await getCategoryModel();
    const result = await Category.updateOne({ _id: categoryId }, category);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 카테고리 삭제
 */
router.delete('/v1/categories/:categoryId', async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;

    const Category = await getCategoryModel();
    const result = await Category.deleteOne({ _id: categoryId });

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 카테고리 단건 조회
 */
router.get('/v1/categories/:categoryId', async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;

    // 조회
    const Category = await getCategoryModel();
    const category = await Category.findOne({
      _id:  categoryId,
    });

    // 데이터 가공
    const payload = category ? {
      id: category._id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
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
 * 카테고리 리스트 조회
 */
router.get('/v1/categories', async (req, res, next) => {
  try {
    const filter = JSON.parse(req.query.filter || null);
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    const Category = await getCategoryModel();
    let categories = Category.find( filter );                                      // 필터
    if (field) categories = categories.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) categories = categories.sort(orders);                               // 정렬
    if (paging) categories = categories.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    categories = await categories;

    // 데이터 가공
    const payload = [];
    for (let category of categories) {
      payload.push({
        id: category._id,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
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
