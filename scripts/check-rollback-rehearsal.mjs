import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const rehearsalRoot = mkdtempSync(join(tmpdir(), 'hseehub-rollback-'));
const releases = ['release-a', 'release-b'];

function hash(path) { return createHash('sha256').update(readFileSync(path)).digest('hex'); }
function aliasTo(releaseId) { writeFileSync(join(rehearsalRoot, 'production-alias'), `${releaseId}\n`, { encoding: 'utf8' }); }
function currentAlias() { return readFileSync(join(rehearsalRoot, 'production-alias'), 'utf8').trim(); }

try {
  for (const releaseId of releases) {
    const releaseDir = join(rehearsalRoot, releaseId);
    mkdirSync(releaseDir);
    writeFileSync(join(releaseDir, 'release.json'), JSON.stringify({ releaseId, immutable: true, contentVersion: '2026-08-13' }));
    writeFileSync(join(releaseDir, 'artifact.bin'), `built-artifact:${releaseId}\n`);
  }

  aliasTo('release-b');
  if (currentAlias() !== 'release-b') throw new Error('candidate alias did not point to release-b');

  const oldReleaseArtifact = join(rehearsalRoot, 'release-a', 'artifact.bin');
  const oldHashBefore = hash(oldReleaseArtifact);
  const oldMtimeBefore = statSync(oldReleaseArtifact).mtimeMs;
  aliasTo('release-a');
  if (currentAlias() !== 'release-a') throw new Error('rollback alias did not point to release-a');
  if (hash(oldReleaseArtifact) !== oldHashBefore) throw new Error('rollback changed the previous immutable artifact');
  if (statSync(oldReleaseArtifact).mtimeMs !== oldMtimeBefore) throw new Error('rollback rewrote the previous immutable artifact');

  console.log('Rollback rehearsal passed (alias switch only; no rebuild or artifact mutation).');
} finally {
  rmSync(rehearsalRoot, { recursive: true, force: true });
}
