const SocketConfig = require('./configs/socket-config');
const ChatSocket = require('./sockets/chat-socket');

const initSocketServer = (server) => {
  const io = SocketConfig.getSocket(server);

  ChatSocket.listen(io);
}

module.exports = initSocketServer;
