import { execFileSync } from 'node:child_process';

const trackedGeneratedPaths = [
  'src/generated-tree-data.ts',
  'src/data.ts',
  'samples/trial-results',
  'samples/handoff-results',
  'samples/runtime-bridge-results',
];

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

const diffNameOnly = runGit(['diff', '--name-only', '--', ...trackedGeneratedPaths]);

if (diffNameOnly) {
  console.error('Generated artifacts are out of sync. Run npm run prebuild and commit the updated generated files.');
  console.error(diffNameOnly);
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  checked_paths: trackedGeneratedPaths,
}, null, 2));
