'use strict';

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const DatabaseConfig = require('../configs/database-config');

let Category;

const getCategoryModel = async () => {
  if (!Category) {
    const conn = await DatabaseConfig.getConnection(DatabaseConfig.db.default);
  
    const categorySchema = new mongoose.Schema({
      categoryId:  Number,
      name: String,
    }, {
      timestamps: true,
    });
    
    categorySchema.plugin(autoIncrement.plugin, {
      model : 'category',
      field : 'categoryId',
      startAt : 1,
      increment : 1,
    });
  
    Category = conn.model('category', categorySchema);
  }

  return Category;
}

module.exports = getCategoryModel;
