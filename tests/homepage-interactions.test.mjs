import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/js/custom-scripts.js', import.meta.url), 'utf8');

function environment(ids = []) {
  const nodes = new Map();
  const timers = new Map();
  const intervals = [];
  let now = Date.parse('2026-10-22T10:00:00Z');
  let timerId = 0;
  class Element {
    constructor() {
      this.attrs = new Map();
      this.events = new Map();
      this.children = [];
      this.dataset = {};
      this.style = { setProperty(name, value) { this[name] = String(value); } };
      this.textContent = '';
      const classes = new Set();
      this.classList = {
        add: (name) => classes.add(name),
        remove: (name) => classes.delete(name),
        contains: (name) => classes.has(name),
        toggle: (name, on) => on ? classes.add(name) : classes.delete(name)
      };
    }
    addEventListener(name, callback) {
      const handlers = this.events.get(name) || [];
      handlers.push(callback);
      this.events.set(name, handlers);
    }
    emit(name, event = {}) { for (const handler of this.events.get(name) || []) handler(event); }
    setAttribute(name, value) { this.attrs.set(name, String(value)); }
    getAttribute(name) { return this.attrs.get(name) ?? null; }
    removeAttribute(name) { this.attrs.delete(name); }
    hasAttribute(name) { return this.attrs.has(name); }
    appendChild(child) { this.children.push(child); return child; }
    replaceChildren(...children) { this.children = children; }
    contains(child) { return child === this || this.children.some((node) => node.contains(child)); }
    focus() { document.activeElement = this; }
    click() { this.emit('click'); }
  }
  const document = new Element();
  document.body = new Element();
  document.documentElement = new Element();
  document.activeElement = document.body;
  document.visibilityState = 'visible';
  document.getElementById = (id) => nodes.get(id) || null;
  document.createElement = (name) => {
    const element = new Element();
    element.tagName = name;
    return element;
  };
  document.createElementNS = (_namespace, name) => {
    const element = new Element();
    element.tagName = name;
    return element;
  };
  document.querySelectorAll = (selector) => selector === '.theme-dot'
    ? document.body.children.flatMap((group) => group.children) : [];
  for (const id of ids) nodes.set(id, new Element());
  const window = new Element();
  window.location = { search: '?mascot=working' };
  window.setTimeout = (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; };
  window.clearTimeout = (id) => timers.delete(id);
  window.setInterval = (callback) => intervals.push(callback);
  window.requestAnimationFrame = (callback) => callback();
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const context = {
    document, window, Date: Clock, Intl, URLSearchParams, AbortController,
    Image: class {}, fetch: async () => { throw new Error('offline'); },
    localStorage: { getItem: () => null, setItem() {} }
  };
  return {
    context, nodes, document, window, timers, intervals,
    advance: (ms) => { now += ms; },
    run(start, end) {
      const first = source.indexOf(start);
      const last = end ? source.indexOf(end, first) : source.length;
      assert.ok(first >= 0 && last > first, 'script section exists');
      vm.runInNewContext(source.slice(first, last), context);
      document.emit('DOMContentLoaded');
    }
  };
}

function snapshot(generated = '2026-10-22T09:00:00Z') {
  return {
    generated_at: generated,
    period: { start: '2026-04-22', end: '2026-10-22' },
    github: { total_contributions: 42, days: [{ date: '2026-10-22', count: 42 }] },
    ai: { period: { start: '2026-05-02', end: '2026-10-19' },
      period_tokens: 0, total_tokens: 999, period_requests: 0, total_requests: 99,
      days: [{ date: '2026-10-22', tokens: 0 }] }
  };
}

function activity(fallback) {
  const env = environment(['activityGrid', 'activityFallbackData', 'activityUpdated',
    'githubActivityMetric', 'tokenActivityMetric', 'tokenRequestCount',
    'githubActivityTitle', 'tokenActivityTitle', 'githubHeatmap', 'tokenHeatmap']);
  env.nodes.get('activityGrid').setAttribute('data-source', '/activity.json');
  env.nodes.get('activityFallbackData').textContent = JSON.stringify(fallback || {});
  env.start = () => env.run('// Activity heatmaps.', '// Time-aware mascot.');
  return env;
}

const settle = () => new Promise(setImmediate);

test('activity keeps zero totals and uses each source\'s actual recorded period', async () => {
  const env = activity(snapshot('2026-09-18T00:00:00Z'));
  env.start();
  await settle();
  assert.equal(env.nodes.get('tokenActivityMetric').textContent, '0');
  assert.equal(env.nodes.get('tokenRequestCount').textContent, '0 requests');
  assert.equal(env.nodes.get('githubActivityTitle').textContent, 'contributions in 6 months');
  assert.equal(env.nodes.get('tokenActivityTitle').textContent, 'tokens tracked');
  assert.match(env.nodes.get('githubActivityTitle').title, /2026-04-22 to 2026-10-22/);
  assert.match(env.nodes.get('tokenActivityTitle').title, /2026-05-02 to 2026-10-19/);
  assert.equal(env.nodes.get('activityUpdated').textContent, 'Using saved activity.');
  assert.equal(env.nodes.get('activityUpdated').hidden, false);
});

test('invalid activity response preserves the prior good snapshot', async () => {
  const env = activity(snapshot());
  const invalid = snapshot();
  invalid.github.total_contributions = 900;
  invalid.ai.days[0].date = '2026-02-30';
  env.context.fetch = async () => ({ ok: true, json: async () => invalid });
  env.start();
  await settle();
  assert.equal(env.nodes.get('githubActivityMetric').textContent, '42');
  assert.equal(env.nodes.get('activityUpdated').textContent, 'Using saved activity.');
});

test('failed activity fetch without usable fallback does not claim a snapshot is displayed', async () => {
  const env = activity();
  env.start();
  await settle();
  assert.equal(env.nodes.get('activityUpdated').textContent, 'Activity unavailable.');
  assert.equal(env.nodes.get('activityUpdated').hidden, false);
});

test('activity retries without overlapping requests and preserves the newest snapshot', async () => {
  const env = activity(snapshot());
  let resolveRequest;
  let calls = 0;
  env.context.fetch = () => {
    calls++;
    return new Promise((resolve) => { resolveRequest = resolve; });
  };
  env.start();
  env.advance(61_000);
  env.window.emit('focus');
  env.intervals[0]();
  assert.equal(calls, 1);
  const older = snapshot('2026-10-21T09:00:00Z');
  older.github.total_contributions = 12;
  resolveRequest({ ok: true, json: async () => older });
  await settle();
  assert.equal(env.nodes.get('githubActivityMetric').textContent, '42');
  env.window.emit('focus');
  assert.equal(calls, 2);
  resolveRequest({ ok: true, json: async () => snapshot() });
  await settle();
  assert.equal(env.nodes.get('activityUpdated').hidden, true);
  assert.equal(env.nodes.get('activityUpdated').textContent, '');
});

test('activity renders an HTML calendar cell for every recorded day, including zeros', async () => {
  const payload = snapshot();
  payload.github.days.push({ date: '2026-10-21', count: 0 });
  payload.ai.days = [{ date: '2026-10-19', tokens: 17 }];
  const env = activity(payload);
  env.context.fetch = async () => ({ ok: true, json: async () => payload });
  env.start();
  await settle();
  for (const [id, expected] of [['githubHeatmap', 2], ['tokenHeatmap', 1]]) {
    const chart = env.nodes.get(id).children[0];
    assert.equal(chart.tagName, 'div');
    assert.equal(chart.className, 'activity-heatmap__chart');
    const cells = chart.children.filter((node) => node.className.startsWith('activity-cell '));
    assert.equal(cells.length, expected);
    for (const cell of cells) {
      assert.equal(cell.tagName, 'span');
      assert.ok(Number(cell.style.gridColumn) >= 2);
      assert.ok(Number(cell.style.gridRow) >= 2 && Number(cell.style.gridRow) <= 8);
      assert.match(cell.className, /^activity-cell level-[0-4]$/);
      assert.equal(cell.getAttribute('aria-label'), cell.title);
      assert.ok(cell.title.length > 0);
    }
    assert.equal(cells.filter((cell) => cell.getAttribute('tabindex') === '0').length, 1);
  }
  const githubCells = env.nodes.get('githubHeatmap').children[0].children
    .filter((node) => node.className.startsWith('activity-cell '));
  assert.equal(githubCells[0].className, 'activity-cell level-0');
  assert.equal(githubCells[0].style.gridRow, '5'); // Wednesday, 2026-10-21.
  assert.equal(env.nodes.get('activityUpdated').hidden, true);
});

test('activity supports day/week keyboard navigation with one tab stop per chart', async () => {
  const payload = snapshot();
  payload.github.days = Array.from({ length: 10 }, (_, i) => ({ date: '2026-10-' + (13 + i), count: i }));
  const env = activity(payload);
  env.start();
  await settle();
  const chart = env.nodes.get('githubHeatmap').children[0];
  const cells = chart.children.filter((node) => node.className.startsWith('activity-cell '));
  cells.at(-1).focus();
  for (const [key, index] of [['Home', 0], ['ArrowRight', 7], ['ArrowDown', 8], ['ArrowUp', 7], ['ArrowLeft', 0], ['End', 9]]) {
    let prevented = false;
    chart.emit('keydown', { key, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(env.document.activeElement, cells[index]);
    assert.equal(cells.filter((cell) => cell.getAttribute('tabindex') === '0').length, 1);
  }
});

test('activity aborts a stuck request and allows the next refresh', async () => {
  const env = activity(snapshot());
  let calls = 0;
  env.context.fetch = (_url, { signal }) => {
    calls++;
    return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
  };
  env.start();
  [...env.timers.values()].find((timer) => timer.delay === 10000).callback();
  await settle();
  assert.equal(env.nodes.get('activityUpdated').textContent, 'Using saved activity.');
  env.advance(61_000);
  env.window.emit('focus');
  assert.equal(calls, 2);
  [...env.timers.values()].find((timer) => timer.delay === 10000).callback();
  await settle();
});

test('mascot contact opens accessibly and Escape restores focus to its trigger', () => {
  const env = environment(['mascotWidget', 'mascotButton', 'mascotImage', 'mascotStatus',
    'mascotBubble', 'mascotContact', 'mascotContactClose', 'mascotEmailSend']);
  const button = env.nodes.get('mascotButton');
  const contact = env.nodes.get('mascotContact');
  const email = env.nodes.get('mascotEmailSend');
  const close = env.nodes.get('mascotContactClose');
  contact.appendChild(email);
  contact.appendChild(close);
  env.run('// Time-aware mascot.');
  assert.equal(contact.hasAttribute('inert'), true);
  button.click();
  button.click();
  assert.equal(contact.hasAttribute('inert'), false);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(env.document.activeElement, email);
  let prevented = false;
  env.document.emit('keydown', { key: 'Escape', preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(contact.getAttribute('aria-hidden'), 'true');
  assert.equal(contact.hasAttribute('inert'), true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(env.document.activeElement, button);
  button.click();
  button.click();
  close.focus();
  close.click();
  assert.equal(env.document.activeElement, button);
});

test('theme selection exposes exactly one pressed button and recovers invalid saved themes', () => {
  const env = environment();
  env.context.localStorage.getItem = () => 'not-a-theme';
  env.run('// ── Theme Switcher', '// ── Scroll-spy');
  const buttons = env.document.querySelectorAll('.theme-dot');
  assert.equal(buttons.filter((button) => button.getAttribute('aria-pressed') === 'true').length, 1);
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'true');
  buttons[3].click();
  assert.equal(env.document.documentElement.getAttribute('data-theme'), 'dark');
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'false');
  assert.equal(buttons[3].getAttribute('aria-pressed'), 'true');
});
