import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const roots = ['app', 'components', 'lib', 'scripts'].map((directory) => join(root, directory));
const extensions = new Set(['.ts', '.tsx', '.mjs']);
const failures = [];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return walk(path);
    return extensions.has(extname(path)) ? [path] : [];
  });
}

for (const file of roots.flatMap(walk)) {
  const source = readFileSync(file, 'utf8');
  const display = relative(root, file);
  if (/style=\{\{/.test(source)) failures.push(`${display}: 页面布局不得散落 inline style，请使用语义 class/token`);
  if (/\b(?:javascript|vbscript|file):/i.test(source)) failures.push(`${display}: 禁止危险协议`);
  if (/(?:color|background(?:Color)?)["']?\s*[:=]\s*["']?(?:#|rgb\()/i.test(source)) failures.push(`${display}: 业务代码不得硬编码颜色，请消费语义 token`);
}

if (failures.length > 0) {
  console.error('Source lint failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Source lint passed (${roots.length} roots scanned).`);
