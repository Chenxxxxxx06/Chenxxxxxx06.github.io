import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CATALOG, PUBLIC_TOPIC_RULES } from '../api/_lib/catalog.mjs';
import { serializePublicKnowledge } from '../scripts/export-public-knowledge.mjs';

test('the shipped public notes are generated from the approved API catalog and policy', () => {
  const actual = readFileSync(new URL('../assets/data/public-knowledge.json', import.meta.url), 'utf8');
  assert.equal(actual, serializePublicKnowledge(), 'Run node scripts/export-public-knowledge.mjs after editing the catalog.');
  for (const [intent, expression] of PUBLIC_TOPIC_RULES) {
    assert.ok(Object.hasOwn(CATALOG, intent));
    assert.doesNotThrow(() => new RegExp(expression, 'i'));
  }
});

test('updated public facts include the expected PhD and keep unpublished details out', () => {
  assert.match(CATALOG['opportunity.graduate'].answer.en, /September 2026.*2027/);
  assert.doesNotMatch(CATALOG['opportunity.graduate'].answer.en, /exploring graduate|looking for advisors/i);
  assert.match(CATALOG['honors.summary'].answer.en, /2025.*October 2026/);
  assert.match(CATALOG['education.advisor'].answer.en, /name private.*love my advisor/);
  assert.match(CATALOG['profile.now'].answer.en, /vlogger.*internships/);
  assert.equal(CATALOG['opportunity.internship'].sources[0].url, '/#more-to-come');
  assert.match(CATALOG['news.summary'].answer.en, /September 2026.*October 2026/);
  assert.match(CATALOG['publications.status'].answer.en, /LongInterSQL/);
  assert.doesNotMatch(JSON.stringify(CATALOG), /\.pdf|api[_-]?key|DASHSCOPE/i);
});
