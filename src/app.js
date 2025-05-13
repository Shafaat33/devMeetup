const express = require('express');
const connectDB = require('./config/databaseConnection');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const { signUpValidator } = require('./utils/validation');
const app = express();
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { userAuth } = require('./middlewares/Auth');

app.use(express.json());
app.use(cookieParser());

app.get('/feed', async (req, res) => {
  try {
    const user = await User.find({ });
    res.send(user);
  } catch (error) {
    res.status(400).send("no user found");
  }
});

app.get('/profile', userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(400).send("ERROR: " + error.message);
  }
});

app.get('/user', async (req, res) => {
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
})

app.delete('/user', async (req, res) => {
  const userId = req.body.userId;
  try {
    await User.findByIdAndDelete(userId);
    res.send('User deleted successfully');
  } catch (error) {
    res.status(400).send('Something went wrong');
  }
});

app.patch('/user/update/', async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;
  try {
    await User.findByIdAndUpdate({ _id: userId }, data, { runValidators: true });
    res.send('user updated successfully');
  } catch (error) {
    res.status(400).send('something went wrong' + error.message);
  }
});

app.post('/signup', async (req, res) => {
  try {
    signUpValidator(req);
    const { firstName, lastName, emailId, password } = req.body;
    const encryptedPassword = await bcrypt.hash(password, 10);
    console.log(encryptedPassword);
    const userData = new User({ firstName, lastName, emailId, password: encryptedPassword });
    await userData.save();
    res.send(`user saved successfully!`);
  } catch (error) {
    res.status(400).send('Error saving the user ' + error.message);
  }
});

app.post('/connectionRequest', userAuth, async (req, res) => {
  try {
    const user = req.user;
    console.log('connection request send');
    res.send(user.firstName + "logged in successful");
  } catch (error) {
    res.send('connection failed');
  }
});

app.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid email");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      const token = await jwt.sign({ _id: user._id }, 'DEV@Tinder007', { expiresIn: '1d' });
      console.log(token);
      res.cookie('token', token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send("Logged In successfully");
    } else {
      throw new Error("Invalid password");
    }
  } catch (error) {
    res.status(400).send("Error Login: " + error.message);
  }
})

connectDB().then(() => {
  console.log('Database connected!')
  app.listen(3001, () => {
    console.log('app running on port 3001');
  });
}).catch((error) => {
  console.error('Connection Failed!', error);
});

