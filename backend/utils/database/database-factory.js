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
    let opened = false;
    const conn = mongoose.createConnection(host);
    if ('function' === typeof options.onOpen) {
      conn.once('open', () => {
        options.onOpen();
        opened = true;
      });
    }
    if ('function' === typeof options.onError) {
      conn.on('error', err => {
        if (opened) options.onError(err);
      });
    }
    conn.catch(options.onError);
    return conn;
  }
}

module.exports = DatabaseFactory;
