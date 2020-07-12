'use strict';

const mongoose = require('mongoose');

/**
 * DB 팩토리
 */
class DatabaseFactory {
  /**
   * DB Connection 생성
   * 
   * @param {*} host
   * @param {*} options 옵션 (onOpen: 커넥션 연결 콜백, onError: 에러 콜백)
   */
  static createConnection(host, options) {
    const conn = mongoose.createConnection(host);
    if ('function' === typeof options.onOpen) {
      conn.once('open', options.onOpen);
    }
    if ('function' === typeof options.onError) {
      conn.on('error', options.onError);
    }
    return conn;
  }
}

module.exports = DatabaseFactory;
