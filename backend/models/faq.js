'use strict';

const mongoose = require('mongoose');
const DatabaseConfig = require('../configs/database-config');

let Faq;

const getFaqModel = async () => {
  if (!Faq) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const faqSchema = new mongoose.Schema({
      faqId:  Number,
      title: String,
      content: String,
    }, {
      timestamps: true,
    });
  
    Faq = conn.model('faq', faqSchema);
  }

  return Faq;
}

module.exports = getFaqModel;
