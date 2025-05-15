const express = require('express');
const profileRouter = express.Router();
const User = require('./../models/user');
const { userAuth } = require('./../middlewares/Auth');

profileRouter.get('/feed', async (req, res) => {
  try {
    const user = await User.find({ });
    res.send(user);
  } catch (error) {
    res.status(400).send('no user found');
  }
});

profileRouter.get('/profile', userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(400).send('ERROR: ' + error.message);
  }
});

profileRouter.delete('/user', async (req, res) => {
  const userId = req.body.userId;
  try {
    await User.findByIdAndDelete(userId);
    res.send('User deleted successfully');
  } catch (error) {
    res.status(400).send('Something went wrong');
  }
});

profileRouter.patch('/user/update/', async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;
  try {
    await User.findByIdAndUpdate({ _id: userId }, data, { runValidators: true });
    res.send('user updated successfully');
  } catch (error) {
    res.status(400).send('something went wrong' + error.message);
  }
});

profileRouter.get('/user', async (req, res) => {
  try {
    const user = await User.find({ emailId: req.body.emailId });
    if (user.length > 0) {
      res.send(user);
    } else {
      res.status(204).send('No record found');
    }
  } catch (error) {
    res.status(400).send('Something went wrong ' + error.message);
  }
});

module.exports = profileRouter;
