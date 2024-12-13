const express = require('express');

const app = express();

app.get("/", (req, res) => {
  res.send("server is up and running");
});

app.get("/test", (req, res) => {
  res.send('test route');
});

app.listen(3001, () => {
  console.log('app running on port 3001');
});
