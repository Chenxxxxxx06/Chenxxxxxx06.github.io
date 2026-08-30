import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const version = '20260830-ask-ai-connected';

function ensureParent(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function relativeUrls(value) {
  return value.replace(/\{\{\s*['"]([^'"]+)['"]\s*\|\s*relative_url\s*\}\}/g, '$1');
}

function renderPortfolio() {
  const source = relativeUrls(readFileSync(join(root, '_pages/includes/portfolio.md'), 'utf8'));
  const lines = source.split(/\r?\n/);
  const heading = lines.shift().replace(/^#\s+/, '');
  return `<h1 id="-portfolio">${heading}</h1>\n\n${lines.join('\n').trim()}\n\n`;
}

function renderTerminal() {
  let source = readFileSync(join(root, '_pages/includes/placement-demo-terminal.html'), 'utf8');
  source = source.replace(/\{\{[^}]*site\.ask_chen\.endpoint[^}]*\}\}/g, '/api/ask');
  source = source.replace(/^(<span class="anchor" id="placement-terminal"><\/span>)\r?\n/, '<p>$1</p>\n');
  return source.trim() + '\n\n';
}

function patchPage(path) {
  let html = readFileSync(path, 'utf8');
  const portfolio = renderPortfolio();
  const terminal = renderTerminal();

  const portfolioPattern = /<h1 id="-portfolio">[\s\S]*?(?=<p><span class="anchor" id="placement-terminal"><\/span><\/p>)/;
  const terminalPattern = /<p><span class="anchor" id="placement-terminal"><\/span><\/p>[\s\S]*?(?=<h1 id="-experience">)/;
  if (!portfolioPattern.test(html) || !terminalPattern.test(html)) {
    throw new Error(`preview markers missing in ${path}`);
  }

  html = html.replace(portfolioPattern, portfolio);
  html = html.replace(terminalPattern, terminal);
  html = html.replace(/placement-demo\.css\?v=[^"']+/g, `placement-demo.css?v=${version}`);
  html = html.replace(/placement-demo\.js\?v=[^"']+/g, `placement-demo.js?v=${version}`);
  writeFileSync(path, html, 'utf8');
}

function copy(source, destination) {
  ensureParent(destination);
  copyFileSync(source, destination);
}

function compileSass() {
  const input = join(root, 'assets/css/main.scss');
  const temp = join(root, 'tmp/sync-preview-main.scss');
  const output = join(root, '_site/assets/css/main.css');
  const source = readFileSync(input, 'utf8').replace(/^---\r?\n---\r?\n/, '');
  ensureParent(temp);
  ensureParent(output);
  writeFileSync(temp, source, 'utf8');

  const npxCli = join(dirname(process.execPath), 'node_modules/npm/bin/npx-cli.js');
  const command = existsSync(npxCli) ? process.execPath : 'npx';
  const commandPrefix = existsSync(npxCli) ? [npxCli] : [];
  const run = spawnSync(command, [
    ...commandPrefix,
    '--yes', 'sass',
    '--load-path=_sass',
    temp,
    output,
    '--style=compressed',
    '--source-map',
    '--no-charset'
  ], { cwd: root, encoding: 'utf8' });
  rmSync(temp, { force: true });
  if (run.status !== 0) {
    throw new Error(`sass compilation failed\n${run.error || ''}\n${run.stdout || ''}\n${run.stderr || ''}`);
  }
}

const pages = [join(root, '_site/index.html'), join(root, '_site/placement-demo.html')];
for (const page of pages) {
  if (!existsSync(page)) throw new Error(`missing generated page: ${page}`);
  patchPage(page);
}

const assets = [
  ['assets/placement-demo/placement-demo.css', '_site/assets/placement-demo/placement-demo.css'],
  ['assets/placement-demo/placement-demo.js', '_site/assets/placement-demo/placement-demo.js'],
  ['assets/portfolio/labvla-symbol.png', '_site/assets/portfolio/labvla-symbol.png'],
  ['assets/portfolio/labvla-wordmark.png', '_site/assets/portfolio/labvla-wordmark.png']
];
for (const [source, destination] of assets) copy(join(root, source), join(root, destination));

compileSass();
console.log(`SYNC_PREVIEW_PAGES=${pages.length}`);
console.log(`SYNC_PREVIEW_ASSETS=${assets.length}`);
console.log('SYNC_PREVIEW_SASS=PASS');
