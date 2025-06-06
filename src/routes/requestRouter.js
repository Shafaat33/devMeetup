const express = require('express');
const requestRouter = express.Router();
const { userAuth } = require('./../middlewares/Auth');
const ConnectionRequest = require('./../models/connectionRequest');
const User = require('./../models/user');

requestRouter.post('/request/send/:status/:toUserId', userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;
    
    const validStatusTypes = ['interested', 'ignored'];
    const toUser = await User.findById(toUserId);

    if (!toUser) {
      return res.json({ message: 'User Not Found' });
    }
    if (!validStatusTypes.includes(status)) {
      res.status(400).json({ message: 'Invalid status type ' + status})
    }
    
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        {
          fromUserId,
          toUserId,
        },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      ],
    });
    
    if (existingRequest) {
      return res
        .status(400)
        .send({ message: "Connection request already exists" });
    }
    
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();
    
    const requestMessageMapper = {
      ignored: `${req.user.firstName} ignored connection request of ${toUser.firstName}`,
      interested: `${req.user.firstName} is interested in ${toUser.firstName}`
    }
    
    res.json({
      message: requestMessageMapper[status],
      data,
    });
  } catch (error) {
    res.status(400).send('connection request failed ' + error);
  }
});

requestRouter.post('/request/receive/:status/:requestId', userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;
    
    const allowedStatus = ['accepted', 'rejected'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).send({ message: "Status not valid!" });
    }
    
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: 'interested',
    });
    
    if (!connectionRequest) {
      return res.status(400).send({ message: "Invalid Connection Request" });
    }
    
    connectionRequest.status = status;
    
    const data = await connectionRequest.save();
    
    res.json({ message: "Request Accepted Successfully", data });
    
  } catch (error) {
    res.status(400).send({ message: "Something went wrong while accepting request"});
  }
});

module.exports = requestRouter;
