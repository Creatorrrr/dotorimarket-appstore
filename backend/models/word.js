'use strict';

const mongoose = require('mongoose');
const DatabaseConfig = require('../configs/database-config');

let Word;

const getWordModel = async () => {
  if (!Word) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const wordSchema = new mongoose.Schema({
      name: String,
      type: String,
    }, {
      timestamps: true,
    });
  
    Word = conn.model('word', wordSchema);
  }

  return Word;
}

module.exports = getWordModel;
