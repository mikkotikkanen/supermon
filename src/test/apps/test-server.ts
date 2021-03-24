import {
  createServer, RequestListener,
} from 'http';

const port = 3001;

const requestHandler: RequestListener = (req, res): void => {
  console.log(`GET ${req.url}`);
  res.end('Hello Node.js Server');
};

const server = createServer(requestHandler);

server.listen(port, () => {
  console.log(`server is listening on ${port}`);
});

// process.on('beforeExit', server.close);
