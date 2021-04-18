const express = require('express');

const app = express();

app.use('/', (req, res) => {
  res.send('Welcome to g-nal_server!');
});

app.listen(1324, () => {
  console.log('server on 1324');
});

// pull request test