const express = require('express');
const userRouter = express.Router();
const ConnectionRequest = require('./../models/connectionRequest');
const User = require('./../models/user');

const { userAuth } = require("../middlewares/Auth");


const SAFE_USER_DATA = ["firstName", "lastName", "age", "gender"];

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    
    const connectionData = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: 'interested',
    }).populate('fromUserId', SAFE_USER_DATA);
    
    res.json({ message: 'Data fetched successfully', data: connectionData });
  } catch (error) {
    res.status(400).send({ message: "Error" + error });
  }
});

userRouter.get('/user/connections', userAuth, async (req, res) =>{
  try {
    const loggedInUser = req.user;
    
    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: 'accepted' },
        { fromUserId: loggedInUser._id, status: 'accepted' },
      ]
    }).populate('fromUserId', SAFE_USER_DATA).populate('toUserId', SAFE_USER_DATA);
    
    const data = connections.map((connection) => {
      if (connection.fromUserId._id.toString() === loggedInUser._id) {
        return connection.toUserId;
      }
      return connection.fromUserId});
    
    res.send({ message: 'Connection Fetched Successfully', data });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = req.query.page;
    let limit = req.query.limit;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id },
        { fromUserId: loggedInUser._id },
      ]
    }).select("fromUserId toUserId");
    
    const hideUsersFromFeed = new Set();
    
    connectionRequests.forEach((request) => {
      hideUsersFromFeed.add(request.fromUserId.toString());
      hideUsersFromFeed.add(request.toUserId.toString());
    });
    
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed)} },
        { _id: { $ne: loggedInUser._id }}
      ]
    }).select(SAFE_USER_DATA).limit(limit).skip(skip);
    
    res.send(users);
  } catch (err) {
    res.send({ message: err.message });
  }
})

module.exports = userRouter;
