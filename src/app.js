const express = require('express');
const connectDB = require('./config/databaseConnection');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(cors(
  {
    origin: 'http://localhost:5173',
    credentials: true,
  },
));
app.use(express.json());
app.use(cookieParser());

const authRouter = require('./routes/authRouter');
const profileRouter = require('./routes/profileRouter');
const requestRouter = require('./routes/requestRouter');
const userRouter = require('./routes/userRouter')

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);

connectDB().then(() => {
  console.log('Database connected!')
  app.listen(3001, () => {
    console.log('app running on port 3001');
  });
}).catch((error) => {
  console.error('Connection Failed!', error);
});

