'use strict';

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const DatabaseConfig = require('../configs/database-config');

let Chat;

const getChatModel = async () => {
  if (!Chat) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const chatSchema = new mongoose.Schema({
      chatId:  Number,
      title: String,
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'account' }],
      contents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chatcontent' }],
    }, {
      timestamps: true,
    });
    
    chatSchema.plugin(autoIncrement.plugin, {
      model : 'chat',
      field : 'chatId',
      startAt : 1,
      increment : 1,
    });
  
    Chat = conn.model('chat', chatSchema);
  }

  return Chat;
}

module.exports = getChatModel;
