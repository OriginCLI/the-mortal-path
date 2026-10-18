// Stamps the service worker in an assembled site folder with a version and the list of files to
// precache, so the game works offline after the first visit. Usage: node tools/build-sw.js _site <version>
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const [root = '_site', version = String(Date.now())] = process.argv.slice(2);
const files = ['./'];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else files.push(relative(root, p).split('\\').join('/'));
  }
};
walk(join(root, 'game'));
walk(join(root, 'shared'));
files.push('index.html', 'manifest.webmanifest');

const swPath = join(root, 'sw.js');
const src = readFileSync(swPath, 'utf8')
  .replace("const VERSION = 'dev';", `const VERSION = ${JSON.stringify(version.slice(0, 12))};`)
  .replace('const FILES = [];', `const FILES = ${JSON.stringify(files)};`);
if (!src.includes(JSON.stringify(files))) throw new Error('sw.js placeholders not found');
writeFileSync(swPath, src);
console.log(`Service worker ${version.slice(0, 12)}: ${files.length} files precached.`);
