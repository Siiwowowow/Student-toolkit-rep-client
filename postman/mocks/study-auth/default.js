const http = require('http');
let status = 200;
// Test-control endpoint is local-only; it is not part of the application API.
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/__test/status' && req.method === 'POST') {
    status = Number(url.searchParams.get('code'));
    res.writeHead(200); return res.end('Configured');
  }
  res.setHeader('Content-Type', 'application/json');
  if (url.pathname === '/auth/me' && req.method === 'GET') {
    res.writeHead(status);
    return res.end(JSON.stringify(status === 200
      ? { success: true, data: { uid: 'playback-test', email: 'playback@example.test', name: 'Playback test', role: 'student', profileComplete: true } }
      : { success: false, message: 'Simulated account verification failure' }));
  }
  res.writeHead(501); res.end(JSON.stringify({ success: false, message: 'Outside this test contract' }));
}).listen(process.env.PORT || 4500);
