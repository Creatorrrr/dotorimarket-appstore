'use strict';

const { logger } = require('./logger-config');
const DatabaseFactory = require('../utils/database/database-factory');

const conns = new Map();

class DatabaseConfig {
  /**
   * DB 접속
   * 
   * @param {*} db 연결할 대상 DB (DatabaseConfig.db 하위에서 선택)
   */
  static async getConnection(db) {
    if (!conns.has(db.id)) {
      const promise = async () => {
        const conn = await DatabaseFactory.createConnection(db.host);
        logger.info('DB connected');

        return conn;
      };
      conns.set(db.id, promise());
    }

    return await conns.get(db.id);
  };
}
// 연결 대상 DB 정보
// 'DB_[DB명(UpperCase)]_HOST'의 형식 준수할 것
DatabaseConfig.db = Object.freeze({
  default: {
    id: 0,
    host: process.env.DB_DEFAULT_HOST,
  }
});

// DB HOST정보가 초기화 안 되어 있을 경우 에러 발생
for (let [key, value] of Object.entries(DatabaseConfig.db)) {
  if (!value.host) {
    throw new Error(`DB_${key.toUpperCase()}_HOST is not initialized`);
  }
}

module.exports = DatabaseConfig;
