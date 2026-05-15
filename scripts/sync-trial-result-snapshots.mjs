import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const generatedRoot = path.join(root, 'generated', 'trial-runs');
const samplesRoot = path.join(root, 'samples', 'trial-results');

const trialIds = ['web-saas-mvp', 'agentic-system', 'stm32-firmware', 'rfq-generation', 'technical-report'];

function copyIfExists(source, target) {
  if (!fs.existsSync(source)) return false;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  return true;
}

const copied = [];
for (const id of trialIds) {
  const source = path.join(generatedRoot, id, 'summary.json');
  const target = path.join(samplesRoot, id, 'summary.json');
  if (copyIfExists(source, target)) copied.push(id);
}

const suiteSource = path.join(generatedRoot, 'all-skill-trials-summary.json');
const suiteTarget = path.join(samplesRoot, 'all-skill-trials-summary.json');
const suiteCopied = copyIfExists(suiteSource, suiteTarget);

console.log(JSON.stringify({ copied, suiteCopied }, null, 2));
