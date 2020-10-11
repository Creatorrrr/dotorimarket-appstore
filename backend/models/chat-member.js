'use strict';

const mongoose = require('mongoose');
const DatabaseConfig = require('../configs/database-config');

let ChatMember;

const getChatMemberModel = async () => {
  if (!ChatMember) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const chatMemberSchema = new mongoose.Schema({
      chatId:  Number,
      memberId: String,
    }, {
      timestamps: true,
    });
  
    ChatMember = conn.model('chatmember', chatMemberSchema);
  }

  return ChatMember;
}

module.exports = getChatMemberModel;
