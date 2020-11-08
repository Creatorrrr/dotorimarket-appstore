"use strict";

const mongoose = require("mongoose");
const DatabaseConfig = require("../configs/database-config");

let Deal;

const getDealModel = async () => {
  if (!Deal) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);

    const dealSchema = new mongoose.Schema(
      {
        title: String,
        category: { type: mongoose.Types.ObjectId, ref: "category" },
        price: Number,
        description: String,
        status: String, // S: 판매중, R: 판매예약, F: 판매완료
        imgs: [Object],
        thumbnails: [Object],
        favoriteUserList: { type: String, default: "" }, // 관심 등록한 유저 정보
        chats: [{ type: mongoose.Types.ObjectId, ref: 'chat' }],
        seller: { type: mongoose.Types.ObjectId, ref: "account" },
        sellerName: String,
      },
      {
        timestamps: true,
      }
    );

    Deal = conn.model("deal", dealSchema);
  }

  return Deal;
};

module.exports = getDealModel;
