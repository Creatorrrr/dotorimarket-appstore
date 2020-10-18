'use strict';

const createError = require('http-errors');
const HttpConfig = require('../configs/http-config');
const express = require('express');
const getAccountModel = require('../models/account');
const getChatModel = require('../models/chat');
const getChatContentModel = require('../models/chat-content');
const getDealModel = require('../models/deal');

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
      deal: req.body.dealId,
      members: req.body.members,
    });

    const chatResult = await chat.save();

    const deal = {}
    if (chatResult) deal.chat = chatResult._id;

    const Deal = await getDealModel();
    const dealResult = await Deal.updateOne({ _id: req.body.dealId }, deal);    

    res.json({
      chat: chatResult,
      deal: dealResult,
    });
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
    await getAccountModel();
    await getChatContentModel();
    const Chat = await getChatModel();
    const chat = await Chat.findOne({
      _id: chatId,
    }).populate('members').populate('contents').exec();

    const members = [];
    for (let member of chat.members) {
      members.push({
        id: member._id,
        accountId: member.accountId,
        name: member.name,
        email: member.email,
      });
    }
    const payload = {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      members
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
    const filter = JSON.parse(req.query.filter || null);
    const field = req.query.field || null;
    const keyword = req.query.keyword || null;
    const orders = JSON.parse(req.query.orders || null);
    const paging = JSON.parse(req.query.paging || null);

    // 조회 조건 적용
    await getAccountModel();
    await getChatContentModel();
    const Chat = await getChatModel();
    let chats = Chat.find( filter );                                      // 필터
    if (field) chats = chats.regex(field, new RegExp(`.*${keyword}.*`));  // like 검색
    if (orders) chats = chats.sort(orders);                               // 정렬
    if (paging) chats = chats.skip(paging.skip).limit(paging.limit);      // 페이징

    // 조회
    chats = await chats.populate('members').populate('contents').exec();

    const payload = [];
    for (let chat of chats) {
      const members = [];
      for (let member of chat.members) {
        members.push({
          id: member._id,
          accountId: member.accountId,
          name: member.name,
          email: member.email,
        });
      }
      payload.push({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
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
        account: {
          id: chatContent.account._id,
          accountId: chatContent.account.accountId,
          name: chatContent.account.name,
          email: chatContent.account.email
        },
        chat: {
          id: chatContent.chat._id,
          title: chatContent.chat.title,
          createdAt: chatContent.chat.createdAt,
          updatedAt: chatContent.chat.updatedAt,
        },
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
