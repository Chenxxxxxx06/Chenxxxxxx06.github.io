import { delimiter, dirname, isAbsolute, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const ruby = process.env.JEKYLL_RUBY || 'ruby';
const env = { ...process.env, JEKYLL_ENV: 'development' };
if (isAbsolute(ruby)) {
  const pathKey = Object.keys(env).find(key => key.toLowerCase() === 'path') || 'PATH';
  env[pathKey] = dirname(ruby) + delimiter + (env[pathKey] || '');
}
// Rebuild every template and asset instead of serving stale generated HTML.
const build = spawnSync(ruby, ['-S', 'bundle', 'exec', 'jekyll', 'build'], {
  cwd: root, stdio: 'inherit', env
});
if (build.error) {
  throw new Error('Could not run Ruby/Bundler. Install the Gemfile dependencies with bundle install and put Ruby on PATH, or set JEKYLL_RUBY to ruby.exe.', { cause: build.error });
}
if (build.status !== 0) process.exitCode = build.status || 1;
else console.log('Static preview rebuilt from current sources.');
