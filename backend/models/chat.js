'use strict';

const mongoose = require('mongoose');
const DatabaseConfig = require('../configs/database-config');

let Chat;

const getChatModel = async () => {
  if (!Chat) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const chatSchema = new mongoose.Schema({
      title: String,
      deal: { type: mongoose.Types.ObjectId, ref: 'deal' },
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'account' }],
      contents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chatcontent' }],
    }, {
      timestamps: true,
    });
  
    Chat = conn.model('chat', chatSchema);
  }

  return Chat;
}

module.exports = getChatModel;
