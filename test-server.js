require('http').createServer((req, res) => {
  console.log('Got request!');
  res.end('hello');
}).listen(3000, () => console.log('listening'));
