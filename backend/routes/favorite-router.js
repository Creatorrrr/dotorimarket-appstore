"use strict";

const createError = require("http-errors");
const HttpConfig = require("../configs/http-config");
const express = require("express");

const getCategoryModel = require("../models/category");
const getAccountModel = require("../models/account");
const getDealModel = require("../models/deal");
const getChatModel = require("../models/chat");

const router = express.Router();

// 구분 코드
const favoriteDIV = "<<";

router.post("/v1/favorites", async (req, res, next) => {
  console.log("favorite update");
  console.log("favorite update - favoriteId = " + req.body.dealId);
  const result = {};
  try {
    const userId = req.user.id;
    const dealId = req.body.dealId;

    let userDiv = userId + favoriteDIV;
    const Deal = await getDealModel();
    let deal = await Deal.findOne({
      _id: dealId,
    });

    if (deal.favoriteUserList == undefined) {
      deal.favoriteUserList = "";
    }

    if (deal.favoriteUserList.indexOf(userDiv) > -1) {
      // 기존 관심 상품 등록한 경우
      // 삭제
      deal.favoriteUserList = deal.favoriteUserList.replace(userDiv, ""); // 문자열 제거
      result.bFavorite = false;
    } else {
      // 기존 관심 상품 등록되지 않은 경우
      // 등록 처리
      deal.favoriteUserList += userDiv;
      result.bFavorite = true;
    }
    deal.save();

    res.json({ result });
  } catch (err) {
    next(err);
  }
});

// 좋아요 리스트 표시
router.get("/v1/favorites", async (req, res, next) => {
  console.log("favorite list");
  try {
    const userId = req.user.id;

    const Deal = await getDealModel();
    const findOPtion = {
      favoriteUserList: { $regex: userId + favoriteDIV },
    };

    await getCategoryModel();
    await getChatModel();
    await getAccountModel();

    let deals = await Deal.find(findOPtion)
      .populate("category")
      .populate("chat")
      .populate("seller")
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
        chats,
        seller: deal.seller
          ? {
              id: deal.seller._id,
              accountId: deal.seller.accountId,
              name: deal.seller.name,
              email: deal.seller.email,
            }
          : undefined,
        sellerName: deal.sellerName,
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
