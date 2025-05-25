const express = require('express');
const authRouter = express.Router();
const { signUpValidator } = require('./../utils/validation');
const bcrypt = require('bcrypt');
const User = require('./../models/user');

authRouter.post('/signup', async (req, res) => {
  try {
    signUpValidator(req);
    const { firstName, lastName, emailId, password, age, photoUrl } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);
    const userData = new User({ firstName, lastName, emailId, age, photoUrl, password: encryptedPassword });
    await userData.save();
    res.send(`user saved successfully!`);
  } catch (error) {
    res.status(400).send('Error saving the user ' + error.message);
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid email");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie('token', token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
    } else {
      throw new Error("Invalid password");
    }
  } catch (error) {
    res.status(400).send("Error Login: " + error.message);
  }
});

authRouter.post('/logout', async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now())
  });
  res.send('Log out successful!!')
});

module.exports = authRouter;
