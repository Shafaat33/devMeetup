const express = require('express');
const { userAuth } = require("../middlewares/Auth");
const Chat = require('./../models/chat');

const chatRouter = express.Router();

chatRouter.get('/chat/:chatId', userAuth, async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;
  
  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, chatId]}
    }).populate({
      path: 'messages.senderId',
      select: 'firstName lastName',
    });
    
    if (!chat) {
      chat = new Chat({
        participants: [userId, chatId],
        messages: [],
      })
    }
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.log(error);
  }
});

module.exports = chatRouter;
