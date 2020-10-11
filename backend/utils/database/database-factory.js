'use strict';

const mongoose = require('mongoose');
const { logger } = require('../../configs/logger-config');
const autoIncrement = require('mongoose-auto-increment');

/**
 * DB 팩토리
 */
class DatabaseFactory {
  /**
   * DB Connection 생성
   * 
   * @param {*} host
   */
  static async createConnection(host) {
    const conn = await mongoose.createConnection(host, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      serverSelectionTimeoutMS: 3000,
    });
    autoIncrement.initialize(conn);
  
    return conn;
  }
}

module.exports = DatabaseFactory;
