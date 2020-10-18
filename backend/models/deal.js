'use strict';

const mongoose = require('mongoose');
const DatabaseConfig = require('../configs/database-config');

let Deal;

const getDealModel = async () => {
  if (!Deal) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const dealSchema = new mongoose.Schema({
      title: String,
      categoryId: String,
      price: Number,
      description: String,
      type: String,
      chat: { type: mongoose.Types.ObjectId, ref: 'chat' },
    }, {
      timestamps: true,
    });
  
    Deal = conn.model('deal', dealSchema);
  }

  return Deal;
}

module.exports = getDealModel;
