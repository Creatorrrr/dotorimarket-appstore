'use strict'

const jwt = require('jsonwebtoken');
const SocketConfig = require('../configs/socket-config');
const getAccountModel = require('../models/account');
const getChatModel = require('../models/chat');
const getChatContentModel = require('../models/chat-content');

class ChatSocket {
  static listen(io) {
    const chat = io.of('/chat');
    chat.use(SocketConfig.authenticateJWT);
    chat.on('connection', (socket) => {
      const chatId = socket.handshake.query.chatId;
      const userId = jwt.verify(socket.handshake.headers.authorization, SocketConfig.JWT_SECRET).id;

      socket.join(chatId);

      socket.on('content', async (msg) => {
        const ChatContent = await getChatContentModel();
        const chatContent = new ChatContent({
          content: msg,
          account: userId,
          chat: chatId,
        });

        const saved = await chatContent.save();

        // 조회
        await getAccountModel();
        await getChatModel();
        const found = await ChatContent.findOne({
          _id: saved._id,
        }).populate('account').populate('chat').exec();

        chat.to(chatId).emit('content', {
          id: found._id,
          content: found.content,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
          account: {
            id: found.account._id,
            accountId: found.account.accountId,
            name: found.account.name,
            email: found.account.email
          },
          chat: {
            id: found.chat._id,
            title: found.chat.title,
            createdAt: found.chat.createdAt,
            updatedAt: found.chat.updatedAt,
          },
        });
      });


      socket.on('disconnect', (msg) => {
        socket.leave(chatId);
      });
    });
  }
}

module.exports = ChatSocket;
