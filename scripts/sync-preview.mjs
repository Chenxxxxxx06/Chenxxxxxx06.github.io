import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, isAbsolute, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const override = join(root, 'tmp', 'ask-preview-config.yml');
const ruby = process.env.JEKYLL_RUBY || 'ruby';
const env = { ...process.env, JEKYLL_ENV: 'development' };
if (isAbsolute(ruby)) {
  const pathKey = Object.keys(env).find(key => key.toLowerCase() === 'path') || 'PATH';
  env[pathKey] = dirname(ruby) + delimiter + (env[pathKey] || '');
}
mkdirSync(dirname(override), { recursive: true });
writeFileSync(override, 'ask_chen:\n  endpoint: "/api/ask"\n', 'utf8');
try {
  // Rebuild every template and asset; patching old _site HTML leaves stale UI.
  const build = spawnSync(ruby, [
    '-S', 'bundle', 'exec', 'jekyll', 'build',
    '--config', '_config.yml,tmp/ask-preview-config.yml'
  ], { cwd: root, stdio: 'inherit', env });
  if (build.error) {
    throw new Error('Could not run Ruby/Bundler. Install the Gemfile dependencies with bundle install and put Ruby on PATH, or set JEKYLL_RUBY to ruby.exe.', { cause: build.error });
  }
  if (build.status !== 0) process.exitCode = build.status || 1;
  else console.log('Preview rebuilt from current sources with same-origin /api/ask.');
} finally {
  rmSync(override, { force: true });
}
