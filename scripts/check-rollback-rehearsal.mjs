import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const root = mkdtempSync(join(tmpdir(), 'hseehub-rollback-'));
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
try {
  for (const id of ['release-a', 'release-b']) { const dir = join(root, id); mkdirSync(dir); writeFileSync(join(dir, 'artifact.bin'), `immutable:${id}`); }
  writeFileSync(join(root, 'production-alias'), 'release-b\n');
  const oldArtifact = join(root, 'release-a', 'artifact.bin'); const before = hash(oldArtifact); const mtime = statSync(oldArtifact).mtimeMs;
  writeFileSync(join(root, 'production-alias'), 'release-a\n');
  if (readFileSync(join(root, 'production-alias'), 'utf8').trim() !== 'release-a' || hash(oldArtifact) !== before || statSync(oldArtifact).mtimeMs !== mtime) throw new Error('rollback changed immutable artifact');
  console.log('Rollback rehearsal passed (alias switch only; no rebuild or artifact mutation).');
} finally { rmSync(root, { recursive: true, force: true }); }
