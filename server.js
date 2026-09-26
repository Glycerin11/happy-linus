const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT = __dirname;
const RESULT_FILE = path.join(ROOT, 'ergebnis.txt');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function readResultFile() {
  try {
    const data = fs.readFileSync(RESULT_FILE, 'utf8').trim();
    return data || '';
  } catch (error) {
    return '';
  }
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/survey-status') {
    const result = readResultFile();
    sendJson(res, 200, {
      completed: Boolean(result),
      result,
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/save-result') {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
    });

    req.on('end', () => {
      let payload = {};

      try {
        payload = JSON.parse(raw || '{}');
      } catch (error) {
        payload = {};
      }

      const result = String(payload.result || '').trim();
      fs.writeFileSync(RESULT_FILE, result, 'utf8');
      sendJson(res, 200, { ok: true, result });
    });
    return;
  }

  const safePath = url.pathname === '/' ? '/index.html' : url.pathname;
  const resolvedPath = path.join(ROOT, safePath.replace(/^\//, ''));

  if (!resolvedPath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  serveFile(res, resolvedPath);
});

server.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
