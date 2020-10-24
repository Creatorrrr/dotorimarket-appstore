'use strict'

const jwt = require('jsonwebtoken');
const SocketIO = require('socket.io');

let io;

class SocketConfig {
  /**
   * 소켓 생성
   * 
   * @param {*} server 
   */
  static getSocket(server) {
    if (!io) io = SocketIO(server);

    return io;
  }

  /**
   * JWT 토큰 인증 처리
   */
  static authenticateJWT(socket, next) {
    if (socket.handshake.headers && socket.handshake.headers.authorization) {
      jwt.verify(socket.handshake.headers.authorization, SocketConfig.JWT_SECRET, (err, decoded) => {
        if (err) {
          next(new Error('Unauthorized'));
        } else {
          socket.decoded = decoded;
          next();
        }
      });
    } else {
      next(new Error('Unauthorized'));
    }
  }
}
SocketConfig.JWT_SECRET = process.env.JWT_SECRET; // ***** DB를 통해 처리하도록 개선

module.exports = SocketConfig;
