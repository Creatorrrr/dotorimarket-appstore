'use strict';

const winston = require('winston');
require('winston-daily-rotate-file');
const strip = require('strip-color');

/**
 * 로거 팩토리
 */
class LoggerFactory {
  /**
   * winston 로거 생성
   * 콘솔 로그 : info 레벨 이상
   * 파일 로그 : error 레벨 이상, 압축 아카이브, 최대 용량 1GB, 최대 보관 기간 100일
   * 
   * @param {*} label 
   * @param {*} level 
   * @param {*} filePath 
   */
  static createLogger(label, level, filePath) {
    const colorize = winston.format.colorize().colorize;
    return winston.createLogger({
      transports: [
        new winston.transports.Console({
          level: level.toLowerCase(),
          format: winston.format.combine(
            winston.format.label({ label }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(info => `${info.label} ${info.timestamp} ${colorize(info.level, `[${info.level.toUpperCase()}]`)} - ${info.message}`),
          )
        }),
        new winston.transports.DailyRotateFile({
          level: level.toLowerCase(),
          format: winston.format.combine(
            winston.format.label({ label }),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(info => `${info.label} ${info.timestamp} [${info.level.toUpperCase()}] - ${info.message ? strip(info.message.toString()) : info.message}`),
          ),
          filename: `${filePath}/${label}-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '1gb',
          maxFiles: '100d',
        })
      ]
    });
  }
}

module.exports = LoggerFactory;
