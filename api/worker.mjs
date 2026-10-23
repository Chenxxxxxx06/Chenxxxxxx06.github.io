import { processAsk } from './_lib/service.mjs';
import { evaluatePolicy, validatePayload } from './_lib/policy.mjs';

const ORIGINS = new Set(['https://chenxxxxxx06.github.io', 'http://127.0.0.1:4176', 'http://localhost:4176']);
const MAX_BODY = 4096;

async function readPayload(request) {
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const chunks = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new RangeError(); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export async function reserveModelBudget(database, ip, now = Math.floor(Date.now() / 1000)) {
  if (!database) return false; // No persistent limiter means no paid model call.
  const day = Math.floor(now / 86400), minute = Math.floor(now / 60);
  const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(day + ':' + ip)));
  const anonymousIp = Array.from(digest.slice(0, 16), byte => byte.toString(16).padStart(2, '0')).join('');
  const buckets = [
    ['ip:m:' + minute + ':' + anonymousIp, 5, (minute + 1) * 60],
    ['ip:d:' + day + ':' + anonymousIp, 30, (day + 1) * 86400],
    ['global:m:' + minute, 20, (minute + 1) * 60],
    ['global:d:' + day, 100, (day + 1) * 86400]
  ];
  const results = await database.batch(buckets.map(([bucket, limit, expires]) => database.prepare(
    'INSERT INTO ask_budgets (bucket, used, expires_at) VALUES (?, 1, ?) ON CONFLICT(bucket) DO UPDATE SET used = used + 1 WHERE used < ? RETURNING used'
  ).bind(bucket, expires, limit)));
  await database.prepare('DELETE FROM ask_budgets WHERE expires_at < ?').bind(now).run();
  return results.every(result => result.success && result.results?.length === 1);
}

export function createWorkerHandler({ ask = processAsk, reserve = reserveModelBudget } = {}) {
  return async function fetch(request, env) {
    const origin = request.headers.get('origin');
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Vary': 'Origin' };
    const json = (status, answer, extra = {}) => new Response(JSON.stringify({ status: 'refused', answer, sources: [], ...extra }), { status, headers });
    if (!origin || !ORIGINS.has(origin)) return json(403, 'Origin not allowed.');
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (new URL(request.url).pathname !== '/api/ask') return json(404, 'Not found.');
    if (request.method !== 'POST') return json(405, 'Use POST /api/ask.');
    if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) return json(415, 'Content-Type must be application/json.');
    let payload;
    try { payload = await readPayload(request); }
    catch (error) { return json(error instanceof RangeError ? 413 : 400, 'Invalid request body.'); }
    const validation = validatePayload(payload);
    if (!validation.ok) return json(400, 'Invalid question.');
    try {
      if (evaluatePolicy(validation.query).decision === 'allowed') {
        if (!env.DASHSCOPE_API_KEY) return json(503, 'Could not connect. Please try again.', { status: 'upstream_error' });
        if (!await reserve(env.DB, request.headers.get('cf-connecting-ip') || 'unknown')) {
          headers['Retry-After'] = '60';
          return json(429, 'Please try again later.', { status: 'rate_limited' });
        }
      }
      const result = await ask(payload, { routerOptions: { apiKey: env.DASHSCOPE_API_KEY, baseUrl: env.DASHSCOPE_BASE_URL, model: env.ASK_CHEN_MODEL || 'qwen3.8-max-0902' } });
      return new Response(JSON.stringify(result.body), { status: result.httpStatus, headers });
    } catch { return json(503, 'Could not connect. Please try again.', { status: 'upstream_error' }); }
  };
}

export default { fetch: createWorkerHandler() };
