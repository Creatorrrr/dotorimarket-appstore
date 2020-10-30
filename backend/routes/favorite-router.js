"use strict";

const createError = require("http-errors");
const HttpConfig = require("../configs/http-config");
const express = require("express");
const getDealModel = require("../models/deal");

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

module.exports = router;
