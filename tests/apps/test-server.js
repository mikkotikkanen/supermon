const http = require('http');

const port = 3001;

const requestHandler = (request, response) => {
  console.log(`GET ${request.url}`);
  response.end('Hello Node.js Server');
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
