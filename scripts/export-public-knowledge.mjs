import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { CATALOG, POLICY_RESPONSES, PUBLIC_TOPIC_RULES, PUBLIC_NEWS_QUERY } from '../api/_lib/catalog.mjs';
import { POLICY_TERMS } from '../api/_lib/policy.mjs';

export function serializePublicKnowledge() {
  return JSON.stringify({
    schemaVersion: 1,
    catalog: CATALOG,
    topics: PUBLIC_TOPIC_RULES,
    newsQuery: PUBLIC_NEWS_QUERY,
    responses: POLICY_RESPONSES,
    policy: Object.fromEntries(Object.entries(POLICY_TERMS).map(([key, patterns]) => [
      key, patterns.map(pattern => ({ source: pattern.source, flags: pattern.flags }))
    ]))
  }, null, 2) + '\n';
}

const destination = new URL('../assets/data/public-knowledge.json', import.meta.url);
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const serialized = serializePublicKnowledge();
  if (process.argv.includes('--check')) {
    if (readFileSync(destination, 'utf8') !== serialized) {
      throw new Error('Public notes are stale. Run node scripts/export-public-knowledge.mjs.');
    }
  } else {
    mkdirSync(new URL('../assets/data/', import.meta.url), { recursive: true });
    writeFileSync(destination, serialized, 'utf8');
    console.log('Exported approved public notes.');
  }
}
