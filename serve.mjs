// Static dev server for the website project.
// Serves the directory this file lives in, at http://localhost:3000
// Bound to 127.0.0.1 — not reachable from other machines on the network.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'cache-control': 'no-store',
    ...headers,
  });
  res.end(body);
}

const server = createServer(async (req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${HOST}`).pathname);
  } catch {
    return send(res, 400, 'Bad request', { 'content-type': 'text/plain' });
  }

  // Resolve against ROOT and refuse anything that escapes it.
  const candidate = resolve(join(ROOT, pathname));
  if (candidate !== ROOT && !candidate.startsWith(ROOT + sep)) {
    return send(res, 403, 'Forbidden', { 'content-type': 'text/plain' });
  }

  let filePath = candidate;
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    // fall through to the read below, which produces the 404
  }

  try {
    const data = await readFile(filePath);
    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    send(res, 200, data, { 'content-type': type, 'content-length': data.length });
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'EISDIR') {
      send(res, 404, `404 — not found: ${pathname}`, { 'content-type': 'text/plain; charset=utf-8' });
    } else {
      send(res, 500, `500 — ${err.code}`, { 'content-type': 'text/plain; charset=utf-8' });
    }
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use — a server is probably already running.`);
    console.error(`Do not start a second instance. Use http://localhost:${PORT} as-is,`);
    console.error(`or stop the existing one:  lsof -ti:${PORT} | xargs kill`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT}`);
  console.log(`  → http://localhost:${PORT}`);
});
