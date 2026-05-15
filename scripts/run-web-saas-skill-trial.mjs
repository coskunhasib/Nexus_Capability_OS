import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const ensureDir = (relativePath) => fs.mkdirSync(path.join(root, relativePath), { recursive: true });
const writeJson = (relativePath, data) => fs.writeFileSync(path.join(root, relativePath), JSON.stringify(data, null, 2));

const packs = [
  ...readJson('registry/example-capability-packs.json').capability_packs,
  ...readJson('registry/capability-packs-extra.json').capability_packs,
];
const webPack = packs.find((pack) => pack.pack_id === 'web-saas-mvp-pack');
if (!webPack) throw new Error('Missing web-saas-mvp-pack');

const expectedSkills = [
  'superpowered-planning-skill',
  'review-skill',
  'quality-assurance-skill',
  'frontend-skill',
  'memory-skill',
];

const unique = (items) => Array.from(new Set(items.filter(Boolean)));
const getPacketSkillIds = (packet) => unique([...(packet.routing?.skills ?? []), ...(packet.skills ?? []).map((item) => item.skill)]);
const buildSkillRuntimeFlags = (packet) => {
  const skills = new Set(getPacketSkillIds(packet));
  return {
    planning: skills.has('superpowered-planning-skill'),
    qa: skills.has('quality-assurance-skill'),
    acceleration: skills.has('execution-acceleration-skill'),
    review: skills.has('review-skill'),
    ultraReview: skills.has('ultrareview-skill'),
    contextMode: skills.has('context-mode-skill'),
    frontend: skills.has('frontend-skill'),
    memory: skills.has('memory-skill'),
  };
};
const requiredGatesForSkills = (packet) => {
  const flags = buildSkillRuntimeFlags(packet);
  const gates = new Set();
  if (flags.qa) ['test-evidence', 'regression-coverage', 'traceability'].forEach((gate) => gates.add(gate));
  if (flags.ultraReview) ['risk-clarity', 'tool-trust', 'release-readiness'].forEach((gate) => gates.add(gate));
  if (flags.contextMode) ['context-budget', 'stale-memory-check'].forEach((gate) => gates.add(gate));
  if (flags.memory) ['memory-policy-fit', 'stale-memory-check', 'risk-clarity'].forEach((gate) => gates.add(gate));
  if (flags.frontend) ['ui-state-coverage', 'responsive-check', 'accessibility-baseline'].forEach((gate) => gates.add(gate));
  return Array.from(gates);
};
const allGateIds = (packet) => unique(packet.work_order.flatMap((step) => step.required_gates ?? []));
const skillCoverageWarnings = (packet) => {
  const available = new Set(allGateIds(packet));
  return requiredGatesForSkills(packet)
    .filter((gate) => !available.has(gate))
    .map((gate) => `Skill-required gate is not present in this task packet: ${gate}`);
};
const evidenceIsStrongEnough = (note) => ['test', 'screenshot', 'log', 'artifact', 'reviewed', 'verified', 'passed', 'evidence'].some((token) => note.toLowerCase().includes(token));
const buildSkillDirectives = (packet) => {
  const flags = buildSkillRuntimeFlags(packet);
  const directives = [];
  if (flags.planning) directives.push({ skill: 'superpowered-planning-skill', effect: 'Plan must expose gaps, edge cases and gate mapping.', runner_hint: 'Check whether steps have outputs, gates and blocker notes.' });
  if (flags.qa) directives.push({ skill: 'quality-assurance-skill', effect: 'Missing evidence is a release blocker.', runner_hint: 'Require evidence notes for every required gate.' });
  if (flags.review) directives.push({ skill: 'review-skill', effect: 'Review must separate blocker findings from advisory findings.', runner_hint: 'Classify failed gates, missing evidence and incomplete steps separately.' });
  if (flags.frontend) directives.push({ skill: 'frontend-skill', effect: 'Frontend work must cover UI states and accessibility baseline.', runner_hint: 'Expect UI state, responsive and accessibility evidence when frontend gates exist.' });
  if (flags.memory) directives.push({ skill: 'memory-skill', effect: 'Memory packet must separate durable decisions from temporary context.', runner_hint: 'Keep do_not_store, deprecated assumptions and unresolved blockers explicit.' });
  return directives;
};

const taskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Web SaaS MVP skill-aware trial',
  source_compiler_rule: 'rule-web-saas-mvp',
  routing: {
    macro_pipeline: webPack.macro_pipeline,
    micro_pipelines: webPack.micro_pipelines,
    capability_packs: [webPack.pack_id],
    skills: webPack.skills,
  },
  skills: webPack.skills.map((skill) => ({ skill, required: true })),
  team: webPack.profiles.map((profile) => ({ profile, role: 'owner_or_reviewer' })),
  gates: webPack.quality_gates.map((gate) => ({ gate, required: true })),
  policies: { memory: webPack.memory_policy, context: webPack.context_policy },
  work_order: [
    {
      order: 1,
      id: '01-intake',
      title: 'Intake / Requirement Lock',
      owner: 'requirement-extractor',
      description: 'Lock requirements before implementation.',
      expected_outputs: ['requirements', 'acceptance_criteria', 'open_questions'],
      required_gates: ['clarity', 'scope-fit'],
      status: 'not_started',
    },
    {
      order: 2,
      id: '02-architecture',
      title: 'Architecture / Contract Setup',
      owner: 'system-architect',
      description: 'Define interfaces and system boundaries.',
      expected_outputs: ['architecture_outline', 'interface_contracts'],
      required_gates: ['architecture-coherence'],
      status: 'not_started',
    },
    {
      order: 3,
      id: 'pipeline-frontend-web',
      title: 'Execute: Frontend Web',
      owner: 'frontend-web-engineer',
      description: 'Build frontend surface with explicit UI state and accessibility gates.',
      expected_outputs: ['component_plan', 'state_matrix', 'frontend_handoff'],
      required_gates: ['ui-state-coverage', 'responsive-check', 'accessibility-baseline', 'test-evidence', 'traceability', 'regression-coverage', 'memory-policy-fit', 'risk-clarity'],
      related: 'frontend-web',
      status: 'not_started',
    },
  ],
};

const statuses = {
  '01-intake': 'done',
  '02-architecture': 'in_progress',
  'pipeline-frontend-web': 'blocked',
};

const evidence = {
  '01-intake': {
    clarity: { status: 'pass', evidence_note: 'reviewed acceptance criteria and explicit scope boundaries', blocker_reason: '' },
    'scope-fit': { status: 'pass', evidence_note: 'verified MVP scope against web-saas acceptance criteria', blocker_reason: '' },
  },
  '02-architecture': {
    'architecture-coherence': { status: 'not_checked', evidence_note: '', blocker_reason: '' },
  },
  'pipeline-frontend-web': {
    'ui-state-coverage': { status: 'fail', evidence_note: '', blocker_reason: 'empty/loading/error/permission states are not yet mapped' },
    'responsive-check': { status: 'not_checked', evidence_note: '', blocker_reason: '' },
    'accessibility-baseline': { status: 'not_checked', evidence_note: '', blocker_reason: '' },
    'test-evidence': { status: 'not_checked', evidence_note: '', blocker_reason: '' },
    traceability: { status: 'not_checked', evidence_note: '', blocker_reason: '' },
    'regression-coverage': { status: 'not_checked', evidence_note: '', blocker_reason: '' },
    'memory-policy-fit': { status: 'not_checked', evidence_note: '', blocker_reason: '' },
    'risk-clarity': { status: 'not_checked', evidence_note: '', blocker_reason: '' },
  },
};

function buildReview(packet) {
  const findings = [];
  const skills = getPacketSkillIds(packet);
  const flags = buildSkillRuntimeFlags(packet);
  const coverageWarnings = skillCoverageWarnings(packet);
  for (const warning of coverageWarnings) findings.push({ type: 'skill_coverage_gap', step_id: 'skill-runtime', step_title: 'Skill Runtime Coverage', message: warning, severity: flags.ultraReview ? 'blocker' : 'major', source_skill: 'skill-runtime' });

  for (const step of packet.work_order) {
    const stepStatus = statuses[step.id] ?? step.status ?? 'not_started';
    if (stepStatus === 'blocked') findings.push({ type: 'blocked_step', step_id: step.id, step_title: step.title, message: 'Step is blocked.', severity: 'blocker' });
    if (stepStatus !== 'done') findings.push({ type: 'incomplete_step', step_id: step.id, step_title: step.title, message: `Step is ${stepStatus}.`, severity: stepStatus === 'not_started' ? 'major' : 'minor' });
    for (const gate of step.required_gates ?? []) {
      const item = evidence[step.id]?.[gate] ?? { status: 'not_checked', evidence_note: '', blocker_reason: '' };
      const note = item.evidence_note.trim();
      if (item.status === 'fail') findings.push({ type: 'failed_gate', step_id: step.id, step_title: step.title, gate, message: item.blocker_reason || 'Gate failed without blocker reason.', severity: 'blocker' });
      if (item.status === 'not_checked' || !note) findings.push({ type: 'missing_evidence', step_id: step.id, step_title: step.title, gate, message: flags.qa ? 'QA skill requires direct evidence for every required gate.' : 'Gate evidence is missing or not checked.', severity: flags.qa ? 'blocker' : 'major', source_skill: flags.qa ? 'quality-assurance-skill' : undefined });
      if (flags.qa && item.status === 'pass' && note && !evidenceIsStrongEnough(note)) findings.push({ type: 'missing_evidence', step_id: step.id, step_title: step.title, gate, message: 'Evidence note is present but weak; add test/log/artifact/review proof.', severity: 'major', source_skill: 'quality-assurance-skill' });
    }
  }

  const gateEntries = packet.work_order.flatMap((step) => (step.required_gates ?? []).map((gate) => ({ step, gate, evidence: evidence[step.id]?.[gate] })));
  const failedGates = gateEntries.filter((entry) => entry.evidence?.status === 'fail');
  const missingEvidence = gateEntries.filter((entry) => !entry.evidence || entry.evidence.status === 'not_checked' || !entry.evidence.evidence_note.trim());
  const incompleteSteps = packet.work_order.filter((step) => statuses[step.id] !== 'done');
  const blockerFindings = findings.filter((finding) => finding.severity === 'blocker');
  const skillRuntime = { active_skills: skills, flags, directives: buildSkillDirectives(packet), coverage_warnings: coverageWarnings };
  return {
    objective: packet.objective,
    release_ready: failedGates.length === 0 && missingEvidence.length === 0 && incompleteSteps.length === 0 && blockerFindings.length === 0,
    completed_steps: packet.work_order.filter((step) => statuses[step.id] === 'done').length,
    total_steps: packet.work_order.length,
    blocked_steps: packet.work_order.filter((step) => statuses[step.id] === 'blocked').length,
    incomplete_steps: incompleteSteps.length,
    failed_gates: failedGates.length,
    missing_evidence: missingEvidence.length,
    skills,
    skill_runtime: skillRuntime,
    findings,
    gate_evidence: evidence,
    step_statuses: statuses,
  };
}

const report = buildReview(taskPacket);
const memoryPacket = {
  packet_type: 'nexus.memory_update_packet',
  version: '0.1',
  objective: report.objective,
  active_skills: report.skills,
  skill_runtime: report.skill_runtime,
  release_ready: report.release_ready,
  unresolved_blockers: report.findings.filter((finding) => ['failed_gate', 'blocked_step', 'skill_coverage_gap'].includes(finding.type)),
  do_not_store: ['raw transient UI state', 'temporary not_checked gate placeholders', 'draft evidence notes with no decision value', 'unverified memory candidates'],
};
const contextPacket = {
  packet_type: 'nexus.context_update_packet',
  version: '0.1',
  active_objective: report.objective,
  active_skills: report.skills,
  skill_runtime: report.skill_runtime,
  release_ready: report.release_ready,
  current_blockers: report.findings.filter((finding) => ['failed_gate', 'blocked_step', 'skill_coverage_gap'].includes(finding.type)),
  missing_evidence: report.findings.filter((finding) => finding.type === 'missing_evidence'),
  next_execution_focus: report.release_ready ? ['Finalize handoff.'] : ['Resolve frontend state matrix and missing gate evidence before release.'],
};

const assertions = [
  { name: 'expected skills are selected', pass: expectedSkills.every((skill) => report.skills.includes(skill)) },
  { name: 'release is blocked', pass: report.release_ready === false },
  { name: 'failed gate is visible', pass: report.failed_gates > 0 },
  { name: 'missing evidence is visible', pass: report.missing_evidence > 0 },
  { name: 'QA skill creates blocker missing evidence', pass: report.findings.some((finding) => finding.type === 'missing_evidence' && finding.severity === 'blocker' && finding.source_skill === 'quality-assurance-skill') },
  { name: 'frontend skill flags are active', pass: report.skill_runtime.flags.frontend === true },
  { name: 'memory packet carries do_not_store', pass: Array.isArray(memoryPacket.do_not_store) && memoryPacket.do_not_store.length > 0 },
  { name: 'context packet preserves blockers', pass: contextPacket.current_blockers.length > 0 && contextPacket.missing_evidence.length > 0 },
];

const summary = {
  trial_id: 'web-saas-mvp.skill-aware-run',
  scenario_id: 'web-saas-mvp',
  status: assertions.every((item) => item.pass) ? 'pass' : 'fail',
  assertions,
  report_summary: {
    release_ready: report.release_ready,
    completed_steps: report.completed_steps,
    total_steps: report.total_steps,
    blocked_steps: report.blocked_steps,
    failed_gates: report.failed_gates,
    missing_evidence: report.missing_evidence,
    active_skills: report.skills,
  },
};

ensureDir('generated/trial-runs/web-saas-mvp');
writeJson('generated/trial-runs/web-saas-mvp/task-packet.json', taskPacket);
writeJson('generated/trial-runs/web-saas-mvp/review-report.json', report);
writeJson('generated/trial-runs/web-saas-mvp/memory-update-packet.json', memoryPacket);
writeJson('generated/trial-runs/web-saas-mvp/context-update-packet.json', contextPacket);
writeJson('generated/trial-runs/web-saas-mvp/summary.json', summary);
ensureDir('samples/trial-results/web-saas-mvp');
writeJson('samples/trial-results/web-saas-mvp/summary.json', summary);

console.log(JSON.stringify(summary, null, 2));

if (summary.status !== 'pass') {
  console.error('Skill-aware web SaaS trial failed.');
  process.exit(1);
}
