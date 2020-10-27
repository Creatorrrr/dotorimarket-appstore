"use strict";

const createError = require("http-errors");
const HttpConfig = require("../configs/http-config");
const express = require("express");
const getCategoryModel = require("../models/category");
const getAccountModel = require("../models/account");
const getDealModel = require("../models/deal");
const getChatModel = require("../models/chat");

const { uploadCfg } = require("../configs/upload-config");

const router = express.Router();

/**
 * 거래 생성
 */
router.post(
  "/v1/deals",
  uploadCfg().fields([{ name: "imgs" }]),
  async (req, res, next) => {
    try {
      const userId = req.user.id;

      const Deal = await getDealModel();
      const deal = new Deal({
        title: req.body.title,
        category: req.body.category,
        price: req.body.price,
        description: req.body.description,
        type: req.body.type,
        seller: userId,
      });

      const saved = await deal.save();

      const result = saved
        ? {
            id: saved._id,
            title: saved.title,
            category: saved.category,
            price: saved.price,
            description: saved.description,
            type: saved.type,
            seller: saved.seller,
          }
        : undefined;

      res.json({ result });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * 거래 수정
 */
router.patch("/v1/deals/:dealId", async (req, res, next) => {
  try {
    const dealId = req.params.dealId;
    const deal = {};
    if (req.body.title) deal.title = req.body.title;
    if (req.body.category) deal.categoryId = req.body.category;
    if (req.body.price) deal.price = req.body.price;
    if (req.body.description) deal.description = req.body.description;
    if (req.body.type) deal.type = req.body.type;
    if (req.body.seller) deal.seller = req.body.seller;

    const Deal = await getDealModel();
    const result = await Deal.updateOne({ _id: dealId }, deal);

    res.json({ result });
  } catch (err) {
    next(err);
  }
});

/**
 * 거래 삭제
 */
router.delete("/v1/deals/:dealId", async (req, res, next) => {
  try {
    const dealId = req.params.dealId;

    const Deal = await getDealModel();
    const result = await Deal.deleteOne({ _id: dealId });

    res.json({ result });
  } catch (err) {
    next(err);
  }
});

/**
 * 거래 단건 조회
 */
router.get("/v1/deals/:dealId", async (req, res, next) => {
  try {
    const dealId = req.params.dealId;

    // 조회
    await getCategoryModel();
    await getChatModel();
    await getAccountModel();
    const Deal = await getDealModel();
    const deal = await Deal.findOne({
      _id: dealId,
    })
      .populate("category")
      .populate("chat")
      .populate("seller")
      .exec();

    // 데이터 가공
    const payload = deal
      ? {
          id: deal._id,
          title: deal.title,
          category: deal.category
            ? {
                id: deal.category._id,
                name: deal.category.name,
              }
            : undefined,
          price: deal.price,
          description: deal.description,
          type: deal.type,
          chat: deal.chat
            ? {
                id: deal.chat._id,
                title: deal.chat.title,
                createdAt: deal.chat.createdAt,
                updatedAt: deal.chat.updatedAt,
              }
            : undefined,
          seller: deal.seller
            ? {
                id: deal.seller._id,
                accountId: deal.seller.accountId,
                name: deal.seller.name,
                email: deal.seller.email,
              }
            : undefined,
        }
      : undefined;

    res.json({
      statusCode: HttpConfig.OK.statusCode,
      message: HttpConfig.OK.message,
      result: payload,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * 거래 리스트 조회
 */
router.get("/v1/deals", async (req, res, next) => {
  try {
    const filter = JSON.parse(req.query.filter || null);
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    await getCategoryModel();
    await getChatModel();
    await getAccountModel();
    const Deal = await getDealModel();
    let deals = Deal.find(filter); // 필터
    if (field) deals = deals.regex(field, new RegExp(`.*${keyword}.*`)); // like 검색
    if (orders) deals = deals.sort(orders); // 정렬
    if (paging) deals = deals.skip(paging.skip).limit(paging.limit); // 페이징

    // 조회
    deals = await deals
      .populate("category")
      .populate("chat")
      .populate("seller")
      .exec();

    // 데이터 가공
    const payload = [];
    for (let deal of deals) {
      payload.push({
        id: deal._id,
        title: deal.title,
        category: deal.category
          ? {
              id: deal.category._id,
              name: deal.category.name,
            }
          : undefined,
        price: deal.price,
        description: deal.description,
        type: deal.type,
        chat: deal.chat
          ? {
              id: deal.chat._id,
              title: deal.chat.title,
              createdAt: deal.chat.createdAt,
              updatedAt: deal.chat.updatedAt,
            }
          : undefined,
        seller: deal.seller
          ? {
              id: deal.seller._id,
              accountId: deal.seller.accountId,
              name: deal.seller.name,
              email: deal.seller.email,
            }
          : undefined,
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
