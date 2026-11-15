import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const siteRoot = join(projectRoot, '_site');

const mimeTypes = Object.freeze({
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8'
});

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function staticPath(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (error) {
    return null;
  }
  if (decoded.includes('\0')) return null;
  const candidate = resolve(siteRoot, '.' + decoded);
  if (!candidate.toLowerCase().startsWith(siteRoot.toLowerCase())) return null;
  if (existsSync(candidate) && statSync(candidate).isDirectory()) return join(candidate, 'index.html');
  return candidate;
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { status: 'error', reason: 'method_not_allowed' });
  }

  const filePath = staticPath(requestUrl.pathname);
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    return sendJson(res, 404, { status: 'error', reason: 'not_found' });
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream');
  res.setHeader('Cache-Control', 'no-cache');
  if (req.method === 'HEAD') return res.end();
  createReadStream(filePath).pipe(res);
});

server.on('clientError', (error, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

const host = '127.0.0.1';
const port = Number(process.env.PREVIEW_PORT || 4000);
server.listen(port, host, () => {
  console.log(`HOMEPAGE_PREVIEW=http://${host}:${port}/`);
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));
