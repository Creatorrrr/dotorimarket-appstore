'use strict';

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const DatabaseConfig = require('../configs/database-config');

let Notice;

const getNoticeModel = async () => {
  if (!Notice) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const noticeSchema = new mongoose.Schema({
      noticeId:  Number,
      title: String,
      type: String,
      content: String,
    }, {
      timestamps: true,
    });
    
    noticeSchema.plugin(autoIncrement.plugin, {
      model : 'notice',
      field : 'noticeId',
      startAt : 1,
      increment : 1,
    });
  
    Notice = conn.model('notice', noticeSchema);
  }

  return Notice;
}

module.exports = getNoticeModel;
