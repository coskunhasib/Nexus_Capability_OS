import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const generatedRoot = path.join(root, 'generated', 'trial-runs');
const adapterTrialRoot = path.join(root, 'samples', 'adapter-trial-results');
const assetsDir = path.join(root, 'dist', 'assets');
const outputPath = process.env.GITHUB_STEP_SUMMARY;

const trialIds = ['web-saas-mvp', 'agentic-system', 'stm32-firmware', 'rfq-generation', 'technical-report'];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

function safeRead(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return readJson(filePath);
}

function statusIcon(status) {
  return status === 'pass' ? '✅' : '❌';
}

function bundleSummary() {
  if (!fs.existsSync(assetsDir)) return { initial: 'missing', largest: 'missing', totalJs: 'missing', totalCss: 'missing' };
  const assets = fs.readdirSync(assetsDir)
    .map((name) => {
      const bytes = fs.statSync(path.join(assetsDir, name)).size;
      return { name, bytes, type: name.endsWith('.js') ? 'js' : name.endsWith('.css') ? 'css' : 'other' };
    })
    .filter((asset) => asset.type === 'js' || asset.type === 'css')
    .sort((a, b) => b.bytes - a.bytes);
  const js = assets.filter((asset) => asset.type === 'js');
  const css = assets.filter((asset) => asset.type === 'css');
  const initial = js.find((asset) => /^index-[\w-]+\.js$/.test(asset.name));
  const largest = js[0];
  return {
    initial: initial ? `${initial.name} (${formatBytes(initial.bytes)})` : 'missing',
    largest: largest ? `${largest.name} (${formatBytes(largest.bytes)})` : 'missing',
    totalJs: formatBytes(js.reduce((sum, asset) => sum + asset.bytes, 0)),
    totalCss: formatBytes(css.reduce((sum, asset) => sum + asset.bytes, 0)),
  };
}

const trialSuite = safeRead(path.join(generatedRoot, 'all-skill-trials-summary.json'));
const handoffSuite = safeRead(path.join(generatedRoot, 'nexus-handoff-usability-summary.json'));
const runtimeSuite = safeRead(path.join(generatedRoot, 'nexus-runtime-bridge-summary.json'));
const adapterSuite = safeRead(path.join(adapterTrialRoot, 'adapter-trials-summary.json'));
const bundle = bundleSummary();

const rows = trialIds.map((id) => {
  const trial = safeRead(path.join(generatedRoot, id, 'summary.json'));
  const handoff = safeRead(path.join(generatedRoot, id, 'handoff-usability-summary.json'));
  const runtime = safeRead(path.join(generatedRoot, id, 'runtime-bridge-summary.json'));
  return [
    id,
    trial ? `${statusIcon(trial.status)} ${trial.status}` : 'missing',
    handoff ? `${statusIcon(handoff.status)} ${handoff.status}` : 'missing',
    runtime ? `${statusIcon(runtime.status)} ${runtime.status}` : 'missing',
    String(trial?.report_summary?.missing_evidence ?? '-'),
    String(handoff?.handoff_summary?.required_tool_count ?? '-'),
    String(runtime?.event_count ?? '-'),
  ];
});

const adapterRows = (adapterSuite?.summaries ?? []).map((summary) => [
  summary.trial_id,
  summary.provider,
  `${statusIcon(summary.status)} ${summary.status}`,
  String(summary.runtime_job_summary?.event_count ?? '-'),
  String(summary.runtime_job_summary?.artifact_count ?? '-'),
  String(summary.memory_summary?.accepted_decisions ?? '-'),
  String(summary.memory_summary?.runtime_blockers ?? '-'),
]);

const lines = [
  '# Nexus Capability OS CI Summary',
  '',
  '## Suites',
  '',
  `- Skill trials: ${trialSuite ? `${statusIcon(trialSuite.status)} ${trialSuite.status}` : 'missing'}`,
  `- Nexus handoff usability: ${handoffSuite ? `${statusIcon(handoffSuite.status)} ${handoffSuite.status}` : 'missing'}`,
  `- Nexus runtime bridge: ${runtimeSuite ? `${statusIcon(runtimeSuite.status)} ${runtimeSuite.status}` : 'missing'}`,
  `- Adapter trials: ${adapterSuite ? `${statusIcon(adapterSuite.status)} ${adapterSuite.status}` : 'missing'}`,
  '',
  '## Scenario Matrix',
  '',
  '| Scenario | Trial | Handoff | Runtime | Missing evidence | Tools | Runtime events |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...rows.map((row) => `| ${row.join(' | ')} |`),
  '',
  '## Adapter Trials',
  '',
  '| Trial | Provider | Status | Runtime events | Artifacts | Accepted decisions | Blockers |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...(adapterRows.length ? adapterRows.map((row) => `| ${row.join(' | ')} |`) : ['| missing | - | - | - | - | - | - |']),
  '',
  '## Bundle Budget',
  '',
  `- Initial JS: ${bundle.initial}`,
  `- Largest JS: ${bundle.largest}`,
  `- Total JS: ${bundle.totalJs}`,
  `- Total CSS: ${bundle.totalCss}`,
  '',
];

const markdown = `${lines.join('\n')}\n`;

if (outputPath) {
  fs.appendFileSync(outputPath, markdown);
} else {
  console.log(markdown);
}