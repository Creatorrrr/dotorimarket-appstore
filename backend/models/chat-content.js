'use strict';

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const DatabaseConfig = require('../configs/database-config');

let ChatContent;

const getChatContentModel = async () => {
  if (!ChatContent) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const chatContentSchema = new mongoose.Schema({
      content: String,
      account: { type: mongoose.Schema.Types.ObjectId, ref: 'account' },
      chat: { type: mongoose.Schema.Types.ObjectId, ref: 'chat' },
    }, {
      timestamps: true,
    });
    
    chatContentSchema.plugin(autoIncrement.plugin, {
      model : 'chatContent',
      field : 'chatContentId',
      startAt : 1,
      increment : 1,
    });
  
    ChatContent = conn.model('chatcontent', chatContentSchema);
  }

  return ChatContent;
}

module.exports = getChatContentModel;
