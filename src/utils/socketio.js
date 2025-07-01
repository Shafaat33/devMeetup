const socket = require('socket.io');
const crypto = require('crypto');
const Chat = require('./../models/chat');

const getSecretRoomId = (userId, chatId) => {
  return crypto
    .createHash("sha256")
    .update([userId, chatId].sort().join("_"))
    .digest('hex');
}

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: 'http://localhost:5173'
    }
  });
  
  io.on('connection', (socket) => {
    socket.on('joinChat', ({ userId, chatId }) => {
      const roomId = getSecretRoomId(userId, chatId);
      socket.join(roomId);
    });
    socket.on('sendMessage', async ({ firstName, chatId, userId, text }) => {
      try {
        const roomId = getSecretRoomId(userId, chatId);
        
        let chat = await Chat.findOne({
          participants: { $all: [userId, chatId]},
        });
        if (!chat) {
          chat = new Chat({
            participants: [userId, chatId],
            messages: [],
          })
        }
        
        chat.messages.push({
          senderId: userId,
          text,
        });
        
        await chat.save();
        io.to(roomId).emit('messageReceived', { firstName, text });
      } catch (error) {
        console.log(error);
      }
    });
    socket.on('disconnect', () => {
    });
  })
}

module.exports = {
  initializeSocket,
};
