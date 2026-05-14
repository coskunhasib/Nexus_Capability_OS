import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const registryDir = path.join(root, 'registry');

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(registryDir, file), 'utf8'));
const readList = (file, key) => readJson(file)[key] ?? [];
const ids = (items, key = 'id') => new Set(items.map((item) => item[key]).filter(Boolean));
const addMissing = (missing, kind, id, source) => {
  if (!id) return;
  missing.push({ kind, id, source });
};

const macro = readList('macro-pipelines.json', 'macro_pipelines');
const micro = [
  ...readList('micro-pipelines.json', 'micro_pipelines'),
  ...readList('micro-pipelines-extra.json', 'micro_pipelines'),
];
const profiles = [
  ...readList('agent-profiles.json', 'agent_profiles'),
  ...readList('agent-profiles-extra.json', 'agent_profiles'),
];
const gates = readList('gates.json', 'gates');
const packs = [
  ...readList('example-capability-packs.json', 'capability_packs'),
  ...readList('capability-packs-extra.json', 'capability_packs'),
];
const rules = readList('compiler-rules.json', 'compiler_rules');

const macroIds = ids(macro);
const microIds = ids(micro);
const profileIds = ids(profiles);
const gateIds = ids(gates);
const packIds = ids(packs, 'pack_id');
const missing = [];
const duplicates = [];

function checkDuplicates(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    const id = item[key];
    if (!id) continue;
    if (seen.has(id)) duplicates.push({ label, id });
    seen.add(id);
  }
}

checkDuplicates(macro, 'id', 'macro');
checkDuplicates(micro, 'id', 'micro');
checkDuplicates(profiles, 'id', 'profile');
checkDuplicates(gates, 'id', 'gate');
checkDuplicates(packs, 'pack_id', 'pack');

for (const m of macro) {
  for (const id of m.micro_pipelines ?? []) if (!microIds.has(id)) addMissing(missing, 'micro', id, `macro:${m.id}`);
  for (const id of m.default_gates ?? []) if (!gateIds.has(id)) addMissing(missing, 'gate', id, `macro:${m.id}`);
}

for (const p of micro) {
  if (p.parent_macro && !macroIds.has(p.parent_macro)) addMissing(missing, 'macro', p.parent_macro, `micro:${p.id}`);
  for (const id of p.required_profiles ?? []) if (!profileIds.has(id)) addMissing(missing, 'profile', id, `micro:${p.id}`);
  for (const id of p.required_gates ?? []) if (!gateIds.has(id)) addMissing(missing, 'gate', id, `micro:${p.id}`);
}

for (const p of profiles) {
  for (const id of p.gates ?? []) if (!gateIds.has(id)) addMissing(missing, 'gate', id, `profile:${p.id}`);
}

for (const p of packs) {
  if (p.macro_pipeline && !macroIds.has(p.macro_pipeline)) addMissing(missing, 'macro', p.macro_pipeline, `pack:${p.pack_id}`);
  for (const id of p.micro_pipelines ?? []) if (!microIds.has(id)) addMissing(missing, 'micro', id, `pack:${p.pack_id}`);
  for (const id of p.profiles ?? []) if (!profileIds.has(id)) addMissing(missing, 'profile', id, `pack:${p.pack_id}`);
  for (const id of p.quality_gates ?? []) if (!gateIds.has(id)) addMissing(missing, 'gate', id, `pack:${p.pack_id}`);
}

for (const r of rules) {
  const select = r.select ?? {};
  if (select.macro_pipeline && !macroIds.has(select.macro_pipeline)) addMissing(missing, 'macro', select.macro_pipeline, `rule:${r.id}`);
  for (const id of select.micro_pipelines ?? []) if (!microIds.has(id)) addMissing(missing, 'micro', id, `rule:${r.id}`);
  for (const id of select.profiles ?? []) if (!profileIds.has(id)) addMissing(missing, 'profile', id, `rule:${r.id}`);
  for (const id of select.gates ?? []) if (!gateIds.has(id)) addMissing(missing, 'gate', id, `rule:${r.id}`);
  for (const id of select.capability_packs ?? []) if (!packIds.has(id)) addMissing(missing, 'pack', id, `rule:${r.id}`);
}

const summary = {
  counts: {
    macro: macro.length,
    micro: micro.length,
    profiles: profiles.length,
    gates: gates.length,
    packs: packs.length,
    rules: rules.length,
  },
  missing,
  duplicates,
};

console.log(JSON.stringify(summary, null, 2));

if (missing.length > 0 || duplicates.length > 0) {
  console.error('Registry audit failed. Resolve missing references or duplicate IDs.');
  process.exit(1);
}

console.log('Registry audit passed.');
