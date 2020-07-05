'use strict';

const env = require('../utils/env/env');
const morgan = require('morgan');
const AppConfig = require('./app-config');
const LoggerFactory = require('../utils/logger/logger-factory');

class LoggerConfig {
  /**
   * Express용 미들웨어
   * 
   * @param {*} options 옵션 (level: 로그 레벨 - 기본값 debug, format: morgan 포맷 - 기본값 dev)
   */
  static expressLogger(options){
    return morgan('object' === typeof options && ['string', 'function'].includes(typeof options.format) ? options.format : 'dev', {
      stream: {
        write: message => {
          LoggerConfig.logger['object' === typeof options && 'string' === typeof options.level ? options.level : 'debug'](message.replace(/\r\n/g, '').replace(/\n/g, ''));
        }
      }
    });
  };
}
LoggerConfig.LOG_LEVEL = process.env.LOG_LEVEL || env.log.level;
LoggerConfig.LOG_PATH = process.env.LOG_PATH || env.log.path;

LoggerConfig.logger = LoggerFactory.createLogger(AppConfig.APP_NAME, LoggerConfig.LOG_LEVEL, LoggerConfig.LOG_PATH);

module.exports = LoggerConfig;
