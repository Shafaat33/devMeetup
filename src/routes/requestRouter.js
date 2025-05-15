const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('./../middlewares/Auth');

requestRouter.post('/connectionRequest', userAuth, async (req, res) => {
  try {
    const user = req.user;
    console.log('connection request send');
    res.send(user.firstName + "logged in successful");
  } catch (error) {
    res.send('connection failed');
  }
});

module.exports = requestRouter;
