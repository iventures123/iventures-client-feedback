// Minimal local dev server — no Vercel CLI/account needed. Not used in production;
// `vercel dev` / the real Vercel deploy serve api/submit.js directly.
const http = require('http');
const fs = require('fs');
const path = require('path');
const submitHandler = require('./api/submit');

const PORT = process.env.PORT || 3000;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const server = http.createServer((req, res) => {
  // Parsing through URL strips the query string and normalizes the path, so
  // "/style.css?v=2" resolves and "/..%2f..%2fetc/passwd" can't sneak through
  // as a raw string.
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (err) {
    res.writeHead(400);
    res.end('Bad request');
    return;
  }

  if (req.method === 'POST' && pathname === '/api/submit') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Refuse absurdly large bodies rather than buffering them forever.
      if (body.length > 1e6) req.destroy();
    });
    req.on('end', async () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (err) {
        sendJson(res, 400, { error: 'Invalid JSON' });
        return;
      }
      const fakeRes = {
        _status: 200,
        status(code) { this._status = code; return this; },
        json(obj) { sendJson(res, this._status, obj); },
      };
      try {
        await submitHandler(req, fakeRes);
      } catch (err) {
        console.error(err);
        sendJson(res, 500, { error: 'Server error' });
      }
    });
    return;
  }

  // Static files. path.join normalizes away "..", and the prefix check below
  // rejects anything that still resolves outside this directory — without it,
  // a request like "/../../../.env" would happily serve files from anywhere
  // on the machine (classic path traversal).
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  // fs.readFile throws SYNCHRONOUSLY on a NUL in the path, outside its own
  // callback — so `GET /index.html%00.png` escaped the handler and took the
  // whole dev server down with it.
  if (relative.includes('\0')) { res.writeHead(400); res.end('Bad request'); return; }

  const filePath = path.join(__dirname, relative);
  if (filePath !== __dirname && !filePath.startsWith(__dirname + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Dev server: http://localhost:${PORT}`));
