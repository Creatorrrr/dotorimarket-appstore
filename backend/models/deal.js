'use strict';

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const DatabaseConfig = require('../configs/database-config');

let Deal;

const getDealModel = async () => {
  if (!Deal) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const dealSchema = new mongoose.Schema({
      dealId:  Number,
      title: String,
      categoryId: String,
      price: String,
      description: String,
      type: String,
    });
    
    dealSchema.plugin(autoIncrement.plugin, {
      model : 'deal',
      field : 'dealId',
      startAt : 1,
      increment : 1,
    });
  
    Deal = conn.model('deal', dealSchema);
  }

  return Deal;
}

module.exports = getDealModel;
