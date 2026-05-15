import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const generatedRoot = path.join(root, 'generated', 'trial-runs');
const samplesRoot = path.join(root, 'samples');

const trialIds = ['web-saas-mvp', 'agentic-system', 'stm32-firmware', 'rfq-generation', 'technical-report'];
const snapshotGroups = [
  {
    key: 'trial_results',
    sourceFile: 'summary.json',
    targetDir: 'trial-results',
    targetFile: 'summary.json',
    suiteSource: 'all-skill-trials-summary.json',
    suiteTarget: 'all-skill-trials-summary.json',
  },
  {
    key: 'handoff_results',
    sourceFile: 'handoff-usability-summary.json',
    targetDir: 'handoff-results',
    targetFile: 'handoff-usability-summary.json',
    suiteSource: 'nexus-handoff-usability-summary.json',
    suiteTarget: 'nexus-handoff-usability-summary.json',
  },
  {
    key: 'runtime_bridge_results',
    sourceFile: 'runtime-bridge-summary.json',
    targetDir: 'runtime-bridge-results',
    targetFile: 'runtime-bridge-summary.json',
    suiteSource: 'nexus-runtime-bridge-summary.json',
    suiteTarget: 'nexus-runtime-bridge-summary.json',
  },
];

function copyRequired(source, target) {
  if (!fs.existsSync(source)) {
    throw new Error(`Missing generated snapshot: ${path.relative(root, source)}`);
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

const result = {};
for (const group of snapshotGroups) {
  const copied = [];
  for (const id of trialIds) {
    const source = path.join(generatedRoot, id, group.sourceFile);
    const target = path.join(samplesRoot, group.targetDir, id, group.targetFile);
    copyRequired(source, target);
    copied.push(id);
  }

  const suiteSource = path.join(generatedRoot, group.suiteSource);
  const suiteTarget = path.join(samplesRoot, group.targetDir, group.suiteTarget);
  copyRequired(suiteSource, suiteTarget);

  result[group.key] = { copied, suiteCopied: true };
}

console.log(JSON.stringify(result, null, 2));
