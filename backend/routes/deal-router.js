"use strict";

const createError = require("http-errors");
const HttpConfig = require("../configs/http-config");
const express = require("express");
const sharp = require("sharp");
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

      const Account = await getAccountModel();
      const seller = await Account.findOne({ _id: userId });

      let reqData = JSON.parse(req.body.deal);

      // 섬네일 생성
      const thumbnails = [];
      if (req.files && req.files.imgs) {
        for (let img of req.files.imgs) {
          const filename = `thumb_${img.filename}`;
          const path = `${img.destination}${filename}`;
          const description = await sharp(img.path).resize(200).toFile(`${img.destination}thumb_${img.filename}`);
          thumbnails.push({
            filename,
            path,
            description,
          });
        }
      }

      const Deal = await getDealModel();
      const deal = new Deal({
        title: reqData.title,
        category: reqData.category,
        price: reqData.price,
        description: reqData.description,
        imgs: req.files && req.files.imgs ? req.files.imgs : undefined,
        thumbnails: thumbnails.length > 0 ? thumbnails : undefined,
        status: 'S',
        seller: userId,
        sellerName: seller.name,
      });

      const saved = await deal.save();

      const result = saved
        ? {
            id: saved._id,
            title: saved.title,
            category: saved.category,
            price: saved.price,
            description: saved.description,
            status: saved.status,
            seller: saved.seller,
            sellerName: saved.sellerName,
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
router.patch(
  "/v1/deals/:dealId",
  uploadCfg().fields([{ name: "imgs" }]),
  async (req, res, next) => {
    try {
      const userId = req.user.id;
      const dealId = req.params.dealId;
      let reqData = JSON.parse(req.body.deal);

      const Deal = await getDealModel();
      const deal = await Deal.findOne({
        _id: dealId,
      });

      // 섬네일 생성
      const thumbnails = [];
      if (req.files && req.files.imgs) {
        for (let img of req.files.imgs) {
          const filename = `thumb_${img.filename}`;
          const path = `${img.destination}${filename}`;
          const description = await sharp(img.path).resize(200).toFile(`${img.destination}thumb_${img.filename}`);
          thumbnails.push({
            filename,
            path,
            description,
          });
        }
      }

      if (userId.toString() == deal.seller.toString()) {
        if (reqData.title) deal.title = reqData.title;
        if (reqData.category) deal.categoryId = reqData.category;
        if (reqData.price) deal.price = reqData.price;
        if (reqData.description) deal.description = reqData.description;
        if (reqData.status) deal.status = reqData.status;
        if (reqData.seller) {
          const Account = await getAccountModel();
          const seller = await Account.findOne({ _id: reqData.seller });
          
          deal.seller = reqData.seller;
          deal.sellerName = seller.name;
        }
        if (req.files && req.files.imgs) {
          deal.imgs = req.files.imgs;
        }
        if (thumbnails.length > 0) {
          deal.thumbnails = thumbnails;
        }

        const result = await Deal.updateOne({ _id: dealId }, deal);

        res.json({ result });
      } else {
        // 자신의 글 아님
        throw createError("자신의 글이 아닙니다.");
      }
    } catch (err) {
      next(err);
    }
  }
);

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
    .populate('chats')
    .populate('chats.members')
    .populate("seller")
    .exec();

    // 데이터 가공
    let chats;
    for (let chat of deal.chats) {
      if (!chats) chats = [];
      chats.push({
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      });
    }

    let favorite = false;
    if (deal.favoriteUserList) {
      const favoriteUserList = deal.favoriteUserList.split('<<');
      if (favoriteUserList.find(item => item.toString() == req.user.id.toString())) favorite = true;
    }

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
          status: deal.status,
          imgs: deal.imgs,
          thumbnails: deal.thumbnails,
          chats,
          seller: deal.seller
            ? {
                id: deal.seller._id,
                accountId: deal.seller.accountId,
                name: deal.seller.name,
                email: deal.seller.email,
                place: deal.seller.place,
                img: deal.seller.img,
                thumbnail: deal.seller.thumbnail,
              }
            : undefined,
          sellerName: deal.sellerName,
          favorite,
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
    .populate('category')
    .populate('chats')
    .populate('chats.members')
    .populate('seller')
    .exec();

    // 데이터 가공
    const payload = [];
    for (let deal of deals) {
      let chats;
      for (let chat of deal.chats) {
        if (!chats) chats = [];
        chats.push({
          id: chat._id,
          title: chat.title,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        });
      }
      console.log(deal.favoriteUserList)

      let favorite = false;
      if (deal.favoriteUserList) {
        const favoriteUserList = deal.favoriteUserList.split('<<');
        if (favoriteUserList.find(item => item.toString() == req.user.id.toString())) favorite = true;
      }
      
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
        status: deal.status,
        imgs: deal.imgs,
        thumbnails: deal.thumbnails,
        chats,
        seller: deal.seller
          ? {
              id: deal.seller._id,
              accountId: deal.seller.accountId,
              name: deal.seller.name,
              email: deal.seller.email,
              place: deal.seller.place,
              img: deal.seller.img,
              thumbnail: deal.seller.thumbnail,
            }
          : undefined,
        favorite,
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
