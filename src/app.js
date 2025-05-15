const express = require('express');
const connectDB = require('./config/databaseConnection');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/authRouter');
const profileRouter = require('./routes/profileRouter');
const requestRouter = require('./routes/requestRouter');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);

connectDB().then(() => {
  console.log('Database connected!')
  app.listen(3001, () => {
    console.log('app running on port 3001');
  });
}).catch((error) => {
  console.error('Connection Failed!', error);
});

