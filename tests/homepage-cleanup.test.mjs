import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const file = path => new URL('../' + path, import.meta.url);
const read = path => readFileSync(file(path), 'utf8');

test('homepage retains profile sections without the retired question widget', () => {
  const page = read('_pages/about.md');
  assert.doesNotMatch(page, /placement-demo|ask_chen|api\/ask/);
  for (const section of ['intro.md', 'activity.md', 'news.md', 'pub.md', 'portfolio.md', 'experience.md', 'honors.md']) {
    assert.ok(page.includes('includes/' + section));
  }
  assert.doesNotMatch(read('_config.yml'), /ask_chen|chenxi-ask-public-api/);
  for (const path of ['api/ask.mjs', 'api/worker.mjs', 'api/_lib/catalog.mjs', '_pages/placement-demo.md', '_pages/includes/placement-demo-terminal.html', 'assets/placement-demo/placement-demo.js', 'assets/placement-demo/placement-demo.css', 'assets/data/public-knowledge.json', 'scripts/export-public-knowledge.mjs', 'scripts/ask-preview-server.mjs', '.env.example']) {
    assert.equal(existsSync(file(path)), false, path);
  }
});

test('local preview has no question API or model credentials', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts.preview, 'node scripts/preview-server.mjs');
  assert.doesNotMatch(read('scripts/preview-server.mjs') + read('scripts/sync-preview.mjs'), /api\/ask|ask_chen|ASK_CHEN|DASHSCOPE|\.env\.local/);
});

test('published activity snapshots agree and retain accurate source coverage', () => {
  assert.equal(read('assets/data/activity.json'), read('_data/activity.json'));
  const payload = JSON.parse(read('_data/activity.json'));
  assert.ok(Number.isFinite(Date.parse(payload.generated_at)));
  assert.equal(payload.github.days.length, 183);
  assert.equal(payload.github.total_contributions, payload.github.days.reduce((sum, day) => sum + day.count, 0));
  assert.equal(payload.ai.period_tokens, payload.ai.days.reduce((sum, day) => sum + day.tokens, 0));
  assert.equal(payload.ai.period_requests, payload.ai.days.reduce((sum, day) => sum + day.requests, 0));
  assert.equal(payload.ai.days.at(-1).date, payload.ai.period.end);
  assert.ok(payload.ai.period.end <= payload.period.end);
  assert.ok(payload.ai.total_tokens >= payload.ai.period_tokens);
  assert.ok(!payload.warnings?.length, 'Statistics must be freshly fetched, not a stale fallback');
});
