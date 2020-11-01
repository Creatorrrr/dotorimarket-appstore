'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const getAccountModel = require('../models/account');
const getChatModel = require('../models/chat');
const getChatContentModel = require('../models/chat-content');
const getDealModel = require('../models/deal');
const getCategoryModel = require('../models/category');
const { Schema } = require('mongoose');

const router = express.Router();

const GET_ONE_MODE_SIMPLE = 'simple';
const GET_ONE_MODE_DETAIL = 'detail';

/**
 * 대화 생성
 */
router.post('/v1/chats', async (req, res, next) => {
  try {
    const Chat = await getChatModel();
    const chat = new Chat({
      title: req.body.title,
      deal: req.body.deal,
      members: req.body.members,
    });

    const chatSaved = await chat.save();

    const deal = {}
    if (chatSaved) deal.chat = chatSaved._id;

    const Deal = await getDealModel();
    await Deal.updateOne({ _id: req.body.deal }, deal);

    const result = chatSaved ? {
      id: chatSaved._id,
      title: chatSaved.title,
      deal: chatSaved.deal,
      members: chatSaved.members,
    } : undefined;

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 대화 수정
 */
router.patch('/v1/chats/:chatId', async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const chat = {};
    if (req.body.title) chat.title = req.body.title;
    if (req.body.deal) chat.title = req.body.deal;

    // 지워도 될 것 같음...
    if (req.body.members || req.body.contents) {
      chat.$push = {};
      if (req.body.members) chat.$push.members = req.body.members;
      if (req.body.contents) chat.$push.contents = req.body.contents;
    }

    const Chat = await getChatModel();
    const result = await Chat.updateOne({ _id: chatId }, chat);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 대화 삭제
 */
router.delete('/v1/chats/:chatId', async (req, res, next) => {
  try {
    const chatId = req.params.chatId;

    const Chat = await getChatModel();
    const result = await Chat.deleteOne({ _id: chatId });

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 대화 단건 조회
 */
router.get('/v1/chats/:chatId', async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const mode = req.query.mode || GET_ONE_MODE_SIMPLE;

    // 조회
    await getDealModel();
    await getAccountModel();
    await getChatContentModel();
    const Chat = await getChatModel();
    const chat = await Chat.findOne({
      _id: chatId,
    })
    .populate('deal')
    .populate('deal.category')
    .populate('deal.seller')
    .populate('members')
    .populate('contents')
    .exec();

    let members;
    for (let member of chat.members) {
      if (!members) members = [];
      members.push({
        id: member._id,
        accountId: member.accountId,
        name: member.name,
        email: member.email,
        place: member.place,
        img: member.img,
      });
    }
    const payload = {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      deal: chat.deal ? {
        id: chat.deal._id,
        title: chat.deal.title,
        category: chat.deal.category ? {
          id: chat.deal.category._id,
          name: chat.deal.category.name,
        } : undefined,
        price: chat.deal.price,
        description: chat.deal.description,
        type: chat.deal.type,
        seller: chat.deal.seller ? {
          id: chat.deal.seller._id,
          accountId: chat.deal.seller.accountId,
          name: chat.deal.seller.name,
          email: chat.deal.seller.email,
          place: chat.deal.seller.place,
          img: chat.deal.seller.img,
        } : undefined,
        sellerName: chat.deal.sellerName,
      } : undefined,
      members,
    }

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
 * 대화 리스트 조회
 */
router.get('/v1/chats', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const filter = req.query.filter ? JSON.parse(req.query.filter) : {};
    if (filter.members) {
      filter.members.$in = userId ;
    } else {
      filter.members = { $in: userId };
    }
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    await getDealModel();
    const Account = await getAccountModel();
    const Category = await getCategoryModel();
    await getChatContentModel();
    const Chat = await getChatModel();
    let chats = Chat.find( filter );                                      // 필터
    if (field) chats = chats.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) chats = chats.sort(orders);                               // 정렬
    if (paging) chats = chats.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    chats = await chats
    .populate('deal')
    .populate('members')
    .populate('contents')
    .exec();

    const payload = [];
    for (let chat of chats) {
      let members;
      for (let member of chat.members) {
        if (!members) members = [];
        members.push({
          id: member._id,
          accountId: member.accountId,
          name: member.name,
          email: member.email,
          place: member.place,
          img: member.img,
        });
      }
      const category = await Category.findOne({ _id: chat.deal.category });
      const seller = await Account.findOne({ _id: chat.deal.seller });
      payload.push({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        deal: chat.deal ? {
          id: chat.deal._id,
          title: chat.deal.title,
          category: category ? {
            id: category._id,
            name: category.name,
          } : undefined,
          price: chat.deal.price,
          description: chat.deal.description,
          type: chat.deal.type,
          seller: seller ? {
            id: seller._id,
            accountId: seller.accountId,
            name: seller.name,
            email: seller.email,
            place: seller.place,
            img: seller.img,
          } : undefined,
          sellerName: chat.deal.sellerName,
        } : undefined,
        members,
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

/**
 * 대화참가자 생성
 */
router.post('/v1/chats/:chatId/members', async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const chat = {};
    if (req.body.members) chat.$push = {
      members: req.body.members,
    };

    const Chat = await getChatModel();
    const result = await Chat.updateOne({ _id: chatId }, chat);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 대화참가자 삭제
 */
router.delete('/v1/chats/:chatId/members/:memberId', async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const memberId = req.params.memberId;
    const chat = {};
    if (memberId) chat.$pull = {
      members: memberId,
    };

    const Chat = await getChatModel();
    const result = await Chat.updateOne({ _id: chatId }, chat);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 대화내용 생성
 */
router.post('/v1/chats/:chatId/contents', async (req, res, next) => {
  try {
    const chatId = req.params.chatId;

    const ChatContent = await getChatContentModel();
    const chatContent = new ChatContent({
      content: req.body.content,
      account: req.body.account,
      chat: chatId,
    });

    const chatContentResult = await chatContent.save();

    const chat = {};
    if (chatContentResult) chat.$push = {
      contents: [chatContentResult._id],
    };

    const Chat = await getChatModel();
    const result = await Chat.updateOne({ _id: chatId }, chat);

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 대화내용 삭제
 */
router.delete('/v1/chats/:chatId/contents/:chatContentId', async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const chatContentId = req.params.chatContentId;
    const chat = {};
    if (chatContentId) chat.$pull = {
      contents: chatContentId,
    };

    const Chat = await getChatModel();
    const chatResult = await Chat.updateOne({ _id: chatId }, chat);

    const ChatContent = await getChatContentModel();
    const result = await ChatContent.deleteOne({ _id: chatId });

    res.json({ result });
  } catch(err) {
    next(err);
  }
});

/**
 * 대화내용 리스트 조회
 */
router.get('/v1/chats/:chatId/contents', async (req, res, next) => {
  try {
    const chatId = req.params.chatId;
    const filter = JSON.parse(req.query.filter || null) || {};
    filter.chat = chatId;
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);
    
    // 조회 조건 적용
    await getAccountModel();
    await getChatModel();
    const ChatContent = await getChatContentModel();
    let chatContents = ChatContent.find( filter );                                      // 필터
    if (field) chatContents = chatContents.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) chatContents = chatContents.sort(orders);                               // 정렬
    if (paging) chatContents = chatContents.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    chatContents = await chatContents.populate('account').populate('chat').exec();

    const payload = [];
    for (let chatContent of chatContents) {
      payload.push({
        id: chatContent.id,
        content: chatContent.content,
        createdAt: chatContent.createdAt,
        updatedAt: chatContent.updatedAt,
        account: chatContent.account ? {
          id: chatContent.account._id,
          accountId: chatContent.account.accountId,
          name: chatContent.account.name,
          email: chatContent.account.email,
          place: chatContent.account.place,
          img: chatContent.account.img,
        } : undefined,
        chat: chatContent.chat ? {
          id: chatContent.chat._id,
          title: chatContent.chat.title,
          createdAt: chatContent.chat.createdAt,
          updatedAt: chatContent.chat.updatedAt,
        } : undefined,
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
