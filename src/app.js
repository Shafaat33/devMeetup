const express = require('express');
const connectDB = require('./config/databaseConnection');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const http = require('http');
const { initializeSocket } = require('./utils/socketio');

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
const userRouter = require('./routes/userRouter');
const chatRouter = require('./routes/chatRouter');

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', chatRouter);

const server = http.createServer(app);
initializeSocket(server);

connectDB().then(() => {
  console.log('Database connected!')
  server.listen(3001, () => {
    console.log('app running on port 3001');
  });
}).catch((error) => {
  console.error('Connection Failed!', error);
});
