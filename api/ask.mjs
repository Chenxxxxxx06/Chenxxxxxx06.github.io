import { policyAnswer } from './_lib/catalog.mjs';
import { createRateLimiter, processAsk } from './_lib/service.mjs';

const MAX_BODY_BYTES = 4096;
const minuteRateLimiter = createRateLimiter({ limit: 8, windowMs: 60000 });
const hourlyRateLimiter = createRateLimiter({ limit: 60, windowMs: 3600000 });

function allowedOrigins() {
  const configured = process.env.ASK_CHEN_ALLOWED_ORIGINS || [
    'http://127.0.0.1:4000',
    'http://localhost:4000',
    'https://chenxxxxxx06.github.io'
  ].join(',');
  return new Set(configured.split(',').map((item) => item.trim()).filter(Boolean));
}

function enabled(value) {
  return /^(?:1|true|yes)$/i.test(String(value || ''));
}

function clientKey(req, trustProxy = false) {
  const forwarded = trustProxy && req.headers && req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'unknown';
}

function checkRequestLimit(key, options) {
  if (options.rateLimiter) return options.rateLimiter.check(key);
  const minute = minuteRateLimiter.check(key);
  if (!minute.allowed) return minute;
  return hourlyRateLimiter.check(key);
}

function setBaseHeaders(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Origin');
}

function send(res, statusCode, body) {
  res.statusCode = statusCode;
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      const serialized = JSON.stringify(req.body);
      if (Buffer.byteLength(serialized, 'utf8') > MAX_BODY_BYTES) throw new Error('payload_too_large');
      return req.body;
    }
    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) throw new Error('payload_too_large');
    return JSON.parse(raw);
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new Error('payload_too_large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function handleNodeRequest(req, res, options = {}) {
  setBaseHeaders(res);

  const origin = req.headers && req.headers.origin;
  const requireOrigin = options.requireOrigin ?? (enabled(process.env.ASK_CHEN_REQUIRE_ORIGIN) || Boolean(process.env.VERCEL));
  if (!origin && requireOrigin) {
    return send(res, 403, { status: 'refused', reason: 'origin_required', answer: 'Origin required.', sources: [] });
  }
  if (origin && !allowedOrigins().has(origin)) {
    return send(res, 403, { status: 'refused', reason: 'origin_not_allowed', answer: 'Origin not allowed.', sources: [] });
  }
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return send(res, 405, { status: 'refused', reason: 'method_not_allowed', answer: 'Use POST /api/ask.', sources: [] });
  }

  const contentType = String((req.headers && req.headers['content-type']) || '').toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return send(res, 415, { status: 'refused', reason: 'content_type', answer: 'Content-Type must be application/json.', sources: [] });
  }
  const contentLength = Number((req.headers && req.headers['content-length']) || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return send(res, 413, { status: 'refused', reason: 'payload_too_large', answer: 'Request body is too large.', sources: [] });
  }

  const trustProxy = options.trustProxy ?? (enabled(process.env.ASK_CHEN_TRUST_PROXY) || Boolean(process.env.VERCEL));
  const limit = checkRequestLimit(clientKey(req, trustProxy), options);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfterSeconds));
    return send(res, 429, policyAnswer('rate_limited', 'en', 'rate_limited'));
  }

  let payload;
  try {
    payload = await readBody(req);
  } catch (error) {
    const tooLarge = error && error.message === 'payload_too_large';
    return send(res, tooLarge ? 413 : 400, {
      status: 'refused',
      reason: tooLarge ? 'payload_too_large' : 'invalid_json',
      answer: tooLarge ? 'Request body is too large.' : 'Request body must be valid JSON.',
      sources: []
    });
  }

  const outcome = await (options.processAsk || processAsk)(payload, options.serviceOptions || {});
  return send(res, outcome.httpStatus, outcome.body);
}

export default async function handler(req, res) {
  return handleNodeRequest(req, res);
}

export const __test = Object.freeze({ MAX_BODY_BYTES, minuteRateLimiter, hourlyRateLimiter });
