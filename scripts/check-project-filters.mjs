import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const moduleUrl = pathToFileURL(resolve(root, 'lib/project-filters.ts')).href;
const runtimeCode = `
  import { filterProjects, parseProjectFilters } from ${JSON.stringify(moduleUrl)};
  const source = {
    majors: [{ id: 'major-ime', shortName: '智能医工' }, { id: 'major-bme', shortName: '生物医学工程' }],
    capabilities: [{ id: 'cap-signal', shortName: '信号分析' }],
    scenarios: [{ id: 'scenario-clinical', name: '临床技术' }],
    projects: [
      { id: 'p1', majorIds: ['major-ime'], capabilityIds: ['cap-signal'], scenarioIds: ['scenario-clinical'], viewpoint: '智能医工', durationBands: ['10 分钟'] },
      { id: 'p2', majorIds: ['major-bme'], capabilityIds: ['cap-signal'], scenarioIds: ['scenario-clinical'], viewpoint: '生物医学工程', durationBands: ['30 分钟'] },
      { id: 'p3', majorIds: ['major-ime', 'major-bme'], capabilityIds: [], scenarioIds: [], viewpoint: '跨专业', durationBands: ['60 分钟'] },
    ],
  };
  const count = (params) => filterProjects(source.projects, parseProjectFilters(params, source).values).length;
  const invalid = parseProjectFilters({ major: 'not-a-major' }, source);
  const mixed = parseProjectFilters({ major: 'major-ime', duration: 'not-a-duration' }, source);
  const zero = parseProjectFilters({ major: 'major-ime', viewpoint: '生物医学工程' }, source);
  if (count({}) !== 3) throw new Error('default must show all three projects');
  if (count({ major: 'major-ime', duration: '10 分钟' }) !== 1) throw new Error('valid filters must use AND semantics');
  if (invalid.invalid.length !== 1 || count({ major: 'not-a-major' }) !== 3) throw new Error('invalid filter must be visible but non-destructive');
  if (mixed.valid.length !== 1 || mixed.invalid.length !== 1 || count({ major: 'major-ime', duration: 'not-a-duration' }) !== 2) throw new Error('mixed filters must preserve valid conditions');
  if (zero.valid.length !== 2 || count({ major: 'major-ime', viewpoint: '生物医学工程' }) !== 0) throw new Error('zero-result filters must remain zero');
`;
const result = spawnSync(process.execPath, ['--experimental-strip-types', '--input-type=module', '-e', runtimeCode], { cwd: root, encoding: 'utf8' });
if (result.status !== 0) {
  console.error('Project filter contract failed.');
  console.error(result.stderr || result.stdout);
  process.exit(1);
}
console.log('Project filter contract passed (default, mixed, invalid, zero-result queries).');
