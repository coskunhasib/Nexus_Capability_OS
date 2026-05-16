import { execFileSync } from 'node:child_process';

const generatedPaths = [
  'src/generated-tree-data.ts',
  'src/data.ts',
  'samples/trial-results',
  'samples/handoff-results',
  'samples/runtime-bridge-results',
  'samples/adapter-trial-results',
];

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

const statusLines = runGit(['status', '--porcelain=v1', '--', ...generatedPaths])
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

if (statusLines.length > 0) {
  console.error('Generated artifacts are out of sync. Run npm run prebuild and commit the updated generated files.');
  console.error(statusLines.join('\n'));
  process.exit(1);
}

console.log(JSON.stringify({
  status: 'pass',
  checked_paths: generatedPaths,
}, null, 2));