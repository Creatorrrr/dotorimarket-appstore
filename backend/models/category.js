'use strict';

const mongoose = require('mongoose');
const DatabaseConfig = require('../configs/database-config');

let Category;

const getCategoryModel = async () => {
  if (!Category) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const categorySchema = new mongoose.Schema({
      name: String,
    }, {
      timestamps: true,
    });
  
    Category = conn.model('category', categorySchema);
  }

  return Category;
}

module.exports = getCategoryModel;
