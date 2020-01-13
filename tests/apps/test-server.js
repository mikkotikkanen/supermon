const http = require('http');

const port = 3001;

const requestHandler = (req, res) => {
  console.log(`GET ${req.url}`);
  res.end('Hello Node.js Server');
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    console.log('something bad happened', err);
  } else {
    console.log(`server is listening on ${port}`);
  }
});

process.on('close', server.close);
