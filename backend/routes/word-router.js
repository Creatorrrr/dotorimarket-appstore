'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const getWordModel = require('../models/word');

const router = express.Router();

/**
 * 단어 생성
 */
router.post('/v1/words', async (req, res, next) => {
  try {
    const Word = await getWordModel();

    if (Array.isArray(req.body)) {
      const resultList = [];
      for (let item of req.body) {
        const word = new Word({
          name: item.name,
          type: item.type,
        });
    
        const result = await word.save();

        resultList.push(result);
      }

      res.json({ resultList });
    } else {
      const word = new Word({
        name: req.body.name,
        type: req.body.type,
      });
  
      const result = await word.save();
  
      res.json({ result });
    }
  } catch(err) {
    next(err);
  }
});

/**
 * 단어 수정
 */
router.patch('/v1/words/:wordId', async (req, res, next) => {
  try {
    const wordId = req.params.wordId;
    const word = {
      name: req.body.name,
      type: req.body.type,
    };

    const Word = await getWordModel();
    const result = await Word.updateOne({ _id: wordId }, word);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 단어 삭제
 */
router.delete('/v1/words/:wordId', async (req, res, next) => {
  try {
    const wordId = req.params.wordId;

    const Word = await getWordModel();
    const result = await Word.deleteOne({ _id: wordId });

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 단어 랜덤 조회
 */
router.get('/v1/words/random', async (req, res, next) => {
  try {
    const type = req.query.type || null;

    // 조회
    const Word = await getWordModel();
    const words = await Word.aggregate(
      [
        { $match: { type: type } },
        { $sample: { size: 1 } },
      ]
    );
    const word = words[0];

    // 데이터 가공
    const payload = word ? {
      id: word._id,
      name: word.name,
      type: word.type,
      createdAt: word.createdAt,
      updatedAt: word.updatedAt,
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
 * 단어 단건 조회
 */
router.get('/v1/words/:wordId', async (req, res, next) => {
  try {
    const wordId = req.params.wordId;

    // 조회
    const Word = await getWordModel();
    const word = await Word.findOne({
      _id: wordId,
    });

    // 데이터 가공
    const payload = word ? {
      id: word._id,
      name: word.name,
      type: word.type,
      createdAt: word.createdAt,
      updatedAt: word.updatedAt,
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
 * 단어 리스트 조회
 */
router.get('/v1/words', async (req, res, next) => {
  try {
    const filter = JSON.parse(req.query.filter || null);
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    const Word = await getWordModel();
    let words = Word.find( filter );                                      // 필터
    if (field) words = words.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) words = words.sort(orders);                               // 정렬
    if (paging) words = words.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    words = await words;

    // 데이터 가공
    const payload = [];
    for (let word of words) {
      payload.push({
        id: word._id,
        name: word.name,
        type: word.type,
        createdAt: word.createdAt,
        updatedAt: word.updatedAt,
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
