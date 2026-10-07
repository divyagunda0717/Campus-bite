
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'ok',
      message: 'CampusBite backend is running'
    }));
    return;
  }
  "scripts": {
  "start": "node server.js",
  "migrate": "node migrate.js",
  "seed-users": "node seed-users.js"
}

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Route not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`CampusBite backend running on port ${PORT}`);
});
