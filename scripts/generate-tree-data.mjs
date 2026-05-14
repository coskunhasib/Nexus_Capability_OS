import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const registryDir = path.join(root, 'registry');

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(registryDir, name), 'utf8'));
const macro = readJson('macro-pipelines.json').macro_pipelines ?? [];
const micro = readJson('micro-pipelines.json').micro_pipelines ?? [];
const profiles = readJson('agent-profiles.json').agent_profiles ?? [];
const gates = readJson('gates.json').gates ?? [];
const packs = readJson('example-capability-packs.json').capability_packs ?? [];
const rules = readJson('compiler-rules.json').compiler_rules ?? [];

const node = (id, type, title, summary, extra = {}) => ({
  id,
  type,
  title,
  mini: extra.mini,
  desc: summary,
  bullets: extra.bullets ?? [],
  tags: extra.tags ?? [],
  gates: extra.gates ?? [],
  children: extra.children ?? undefined,
});

const by = (items, key) => items.reduce((acc, item) => {
  const value = item[key] || 'uncategorized';
  acc[value] = acc[value] || [];
  acc[value].push(item);
  return acc;
}, {});

const microByParent = by(micro, 'parent_macro');
const profileByFamily = by(profiles, 'family');
const gateByFamily = by(gates, 'family');

const treeData = node('root', 'Root', 'Nexus Capability OS', 'Registry-generated capability map. src/data.ts is no longer the source of truth; registry/*.json is.', {
  tags: ['registry-generated', 'capability-os'],
  gates: ['architecture-coherence', 'quality-first'],
  children: [
    node('compiler', 'Architecture', 'Capability Compiler', 'Intent -> Team -> Pipeline -> Pack Assembly', {
      tags: ['compiler', 'team-builder'],
      gates: ['correct-assembly'],
      children: [
        node('intent-intake', 'Stage', 'Intent Intake', 'Classifies domain, platform, output, risk, evidence and freshness needs.'),
        node('team-compiler', 'Stage', 'Team Compiler', 'Selects core, domain and review profiles.'),
        node('pipeline-selector', 'Stage', 'Pipeline Selector', 'Selects macro and micro pipeline set.'),
        node('pack-assembler', 'Stage', 'Pack Assembler', 'Binds profiles, skills, tools, gates and policies.'),
        node('gate-injector', 'Stage', 'Quality Gate Injector', 'Injects required control gates into the workflow.'),
      ],
    }),
    node('macro-families', 'Architecture', 'Macro Pipeline Families', 'Top-level work families from registry/macro-pipelines.json.', {
      tags: ['macro-pipelines'],
      children: macro.map((m) => node(m.id, 'Macro Pipeline', m.title, m.summary, {
        tags: m.tags,
        gates: m.default_gates,
        children: (microByParent[m.id] ?? []).map((x) => node(x.id, 'Micro Pipeline', x.title, x.summary, {
          tags: [x.parent_macro],
          gates: x.required_gates,
          bullets: [
            `profiles: ${(x.required_profiles ?? []).join(', ')}`,
            `outputs: ${(x.outputs ?? []).join(', ')}`,
          ],
        })),
      })),
    }),
    node('profile-families', 'Architecture', 'Agent Profile Families', 'Concrete team profiles from registry/agent-profiles.json.', {
      tags: ['profiles'],
      children: Object.entries(profileByFamily).map(([family, items]) => node(`profile-family-${family}`, 'Profile Family', family, `${items.length} agent profiles`, {
        tags: [family],
        children: items.map((p) => node(p.id, 'Profile Family', p.title, p.summary, {
          tags: [p.family],
          gates: p.gates,
          bullets: [
            `does: ${(p.does ?? []).join(', ')}`,
            `outputs: ${(p.outputs ?? []).join(', ')}`,
          ],
        })),
      })),
    }),
    node('quality-gates', 'Architecture', 'Quality Gates', 'Gate registry from registry/gates.json.', {
      tags: ['gates'],
      children: Object.entries(gateByFamily).map(([family, items]) => node(`gate-family-${family}`, 'Gate', family, `${items.length} gates`, {
        tags: [family],
        children: items.map((g) => node(g.id, 'Gate', g.title, g.summary, {
          tags: [g.family, g.severity],
          bullets: [
            `pass: ${(g.pass_criteria ?? []).join(', ')}`,
            `fail: ${(g.fail_criteria ?? []).join(', ')}`,
          ],
        })),
      })),
    }),
    node('capability-packs', 'Architecture', 'Capability Packs', 'Productizable bundles from registry/example-capability-packs.json.', {
      tags: ['packs'],
      children: packs.map((p) => node(p.pack_id, 'Layer', p.pack_id, p.summary, {
        tags: [p.macro_pipeline, p.status],
        gates: p.quality_gates,
        bullets: [
          `micro: ${(p.micro_pipelines ?? []).join(', ')}`,
          `profiles: ${(p.profiles ?? []).join(', ')}`,
        ],
      })),
    }),
    node('compiler-rules', 'Architecture', 'Compiler Rules', 'Intent matching rules from registry/compiler-rules.json.', {
      tags: ['rules'],
      children: rules.map((r) => node(r.id, 'Stage', r.title, `priority ${r.priority}`, {
        tags: [r.status],
        gates: r.select?.gates ?? [],
        bullets: [
          `macro: ${r.select?.macro_pipeline ?? ''}`,
          `pack: ${(r.select?.capability_packs ?? []).join(', ')}`,
        ],
      })),
    }),
  ],
});

const output = `export type NodeType = 'Root' | 'Architecture' | 'Macro Pipeline' | 'Micro Pipeline' | 'Profile Family' | 'Layer' | 'Skill' | 'Tool' | 'Runtime' | 'Memory/Context' | 'Gate' | 'Stage';\n\nexport interface TreeNode {\n  id: string;\n  type: NodeType;\n  title: string;\n  mini?: string;\n  desc?: string;\n  bullets?: string[];\n  tags?: string[];\n  gates?: string[];\n  children?: TreeNode[];\n}\n\nexport const treeData: TreeNode = ${JSON.stringify(treeData, null, 2)};\n`;

fs.writeFileSync(path.join(root, 'src', 'generated-tree-data.ts'), output);
console.log('generated src/generated-tree-data.ts from registry');
