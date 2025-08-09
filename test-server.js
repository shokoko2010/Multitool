// Simple test server to check if the basic setup works
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Test Server Works!</h1>');
});

server.listen(3001, () => {
  console.log('Test server running on http://localhost:3001');
});