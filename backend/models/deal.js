'use strict';

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const DatabaseConfig = require('../configs/database-config');

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

const conn = DatabaseConfig.getConnection(DatabaseConfig.db.default);
const Deal = conn.model('deal', dealSchema);

module.exports = Deal;
