import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const ensureDir = (relativePath) => fs.mkdirSync(path.join(root, relativePath), { recursive: true });
const writeJson = (relativePath, data) => fs.writeFileSync(path.join(root, relativePath), JSON.stringify(data, null, 2));
const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const packs = [
  ...readJson('registry/example-capability-packs.json').capability_packs,
  ...readJson('registry/capability-packs-extra.json').capability_packs,
];

const trialConfigs = [
  {
    id: 'agentic-system',
    packId: 'agentic-system-pack',
    blockedStep: 'pipeline-agentic-system',
    failGate: 'tool-trust',
    missingGates: ['eval-coverage', 'memory-policy-fit', 'context-budget'],
    requiredSkills: ['context-mode-skill', 'memory-skill', 'review-skill', 'ultrareview-skill', 'quality-assurance-skill'],
    requiredFlags: ['qa', 'ultraReview', 'contextMode', 'memory'],
  },
  {
    id: 'stm32-firmware',
    packId: 'firmware-stm32-hvac-driver-pack',
    blockedStep: 'pipeline-stm32-firmware',
    failGate: 'bench-evidence',
    missingGates: ['electrical-safety', 'timing', 'isolation'],
    requiredSkills: ['superpowered-planning-skill', 'review-skill', 'quality-assurance-skill', 'ultrareview-skill', 'memory-skill'],
    requiredFlags: ['planning', 'qa', 'ultraReview', 'memory'],
  },
  {
    id: 'rfq-generation',
    packId: 'qcw-diode-rfq-pack',
    blockedStep: 'pipeline-qcw-diode-stack-rfq',
    failGate: 'spec-completeness',
    missingGates: ['vendor-clarity', 'source-quality'],
    requiredSkills: ['superpowered-planning-skill', 'review-skill', 'ultrareview-skill', 'memory-skill'],
    requiredFlags: ['planning', 'review', 'ultraReview', 'memory'],
  },
  {
    id: 'technical-report',
    packId: 'technical-report-pack',
    blockedStep: 'pipeline-pretreatment',
    failGate: 'drinking-safety',
    missingGates: ['pressure', 'sequence-fit', 'contact-time', 'source-quality'],
    requiredSkills: ['superpowered-planning-skill', 'review-skill', 'quality-assurance-skill', 'ultrareview-skill', 'context-mode-skill', 'memory-skill'],
    requiredFlags: ['planning', 'qa', 'ultraReview', 'contextMode', 'memory'],
  },
];

function skillIds(packet) {
  return unique([...(packet.routing?.skills ?? []), ...(packet.skills ?? []).map((item) => item.skill)]);
}

function flags(packet) {
  const skills = new Set(skillIds(packet));
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
}

function requiredGatesForSkills(packet) {
  const f = flags(packet);
  const gates = new Set();
  if (f.qa) ['test-evidence', 'regression-coverage', 'traceability'].forEach((gate) => gates.add(gate));
  if (f.ultraReview) ['risk-clarity', 'tool-trust', 'release-readiness'].forEach((gate) => gates.add(gate));
  if (f.contextMode) ['context-budget', 'stale-memory-check'].forEach((gate) => gates.add(gate));
  if (f.memory) ['memory-policy-fit', 'stale-memory-check', 'risk-clarity'].forEach((gate) => gates.add(gate));
  if (f.frontend) ['ui-state-coverage', 'responsive-check', 'accessibility-baseline'].forEach((gate) => gates.add(gate));
  return Array.from(gates);
}

function allGateIds(packet) {
  return unique(packet.work_order.flatMap((step) => step.required_gates ?? []));
}

function coverageWarnings(packet) {
  const available = new Set(allGateIds(packet));
  return requiredGatesForSkills(packet)
    .filter((gate) => !available.has(gate))
    .map((gate) => `Skill-required gate is not present in this task packet: ${gate}`);
}

function directives(packet) {
  const f = flags(packet);
  const rows = [];
  if (f.planning) rows.push({ skill: 'superpowered-planning-skill', effect: 'Plan exposes gaps, edge cases and gate mapping.' });
  if (f.qa) rows.push({ skill: 'quality-assurance-skill', effect: 'Missing evidence is a release blocker.' });
  if (f.review) rows.push({ skill: 'review-skill', effect: 'Review separates blockers from advisory findings.' });
  if (f.ultraReview) rows.push({ skill: 'ultrareview-skill', effect: 'Security, risk and metadata trust coverage is required.' });
  if (f.contextMode) rows.push({ skill: 'context-mode-skill', effect: 'Context packets keep blockers and drop irrelevant context.' });
  if (f.memory) rows.push({ skill: 'memory-skill', effect: 'Memory packets separate durable records from temporary context.' });
  if (f.frontend) rows.push({ skill: 'frontend-skill', effect: 'Frontend states and accessibility are checked.' });
  return rows;
}

function makePacket(config) {
  const pack = packs.find((item) => item.pack_id === config.packId);
  if (!pack) throw new Error(`Missing capability pack: ${config.packId}`);
  const firstPipeline = pack.micro_pipelines?.[0] ?? 'main-pipeline';
  const extraSkillGates = requiredGatesForSkills({ routing: { skills: pack.skills }, skills: pack.skills.map((skill) => ({ skill })) });
  const requiredGates = unique([...(pack.quality_gates ?? []), ...config.missingGates, config.failGate, ...extraSkillGates]);
  return {
    packet_type: 'nexus.task_packet',
    version: '0.1',
    objective: `${config.id} skill-aware trial`,
    source_compiler_rule: `trial-${config.id}`,
    routing: {
      macro_pipeline: pack.macro_pipeline,
      micro_pipelines: pack.micro_pipelines,
      capability_packs: [pack.pack_id],
      skills: pack.skills,
    },
    skills: pack.skills.map((skill) => ({ skill, required: true })),
    team: pack.profiles.map((profile) => ({ profile, role: 'owner_or_reviewer' })),
    gates: requiredGates.map((gate) => ({ gate, required: true })),
    policies: { memory: pack.memory_policy, context: pack.context_policy },
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
        id: `pipeline-${firstPipeline}`,
        title: `Execute: ${firstPipeline}`,
        owner: pack.profiles[1] ?? 'owner',
        description: `Run ${firstPipeline} with skill-aware gates and evidence requirements.`,
        expected_outputs: ['implementation_notes', 'evidence_notes', 'handoff_notes'],
        required_gates: requiredGates,
        related: firstPipeline,
        status: 'not_started',
      },
    ],
  };
}

function makeEvidence(packet, config) {
  const target = packet.work_order[1];
  const evidence = {
    '01-intake': {
      clarity: { status: 'pass', evidence_note: 'reviewed acceptance criteria and explicit scope boundaries', blocker_reason: '' },
      'scope-fit': { status: 'pass', evidence_note: 'verified MVP scope against scenario constraints', blocker_reason: '' },
    },
    [target.id]: {},
  };
  for (const gate of target.required_gates) {
    if (gate === config.failGate) evidence[target.id][gate] = { status: 'fail', evidence_note: '', blocker_reason: `${gate} is intentionally failed for trial validation` };
    else if (config.missingGates.includes(gate)) evidence[target.id][gate] = { status: 'not_checked', evidence_note: '', blocker_reason: '' };
    else evidence[target.id][gate] = { status: 'pass', evidence_note: `reviewed ${gate} evidence for trial`, blocker_reason: '' };
  }
  return evidence;
}

function review(packet, config, statuses, evidence) {
  const f = flags(packet);
  const skills = skillIds(packet);
  const findings = [];
  for (const warning of coverageWarnings(packet)) findings.push({ type: 'skill_coverage_gap', step_id: 'skill-runtime', step_title: 'Skill Runtime Coverage', message: warning, severity: f.ultraReview ? 'blocker' : 'major', source_skill: 'skill-runtime' });
  for (const step of packet.work_order) {
    const stepStatus = statuses[step.id] ?? step.status ?? 'not_started';
    if (stepStatus === 'blocked') findings.push({ type: 'blocked_step', step_id: step.id, step_title: step.title, message: 'Step is blocked.', severity: 'blocker' });
    if (stepStatus !== 'done') findings.push({ type: 'incomplete_step', step_id: step.id, step_title: step.title, message: `Step is ${stepStatus}.`, severity: stepStatus === 'not_started' ? 'major' : 'minor' });
    for (const gate of step.required_gates ?? []) {
      const item = evidence[step.id]?.[gate] ?? { status: 'not_checked', evidence_note: '', blocker_reason: '' };
      if (item.status === 'fail') findings.push({ type: 'failed_gate', step_id: step.id, step_title: step.title, gate, message: item.blocker_reason || 'Gate failed.', severity: 'blocker' });
      if (item.status === 'not_checked' || !item.evidence_note.trim()) findings.push({ type: 'missing_evidence', step_id: step.id, step_title: step.title, gate, message: f.qa ? 'QA skill requires direct evidence for every required gate.' : 'Gate evidence is missing or not checked.', severity: f.qa ? 'blocker' : 'major', source_skill: f.qa ? 'quality-assurance-skill' : undefined });
    }
  }
  const gateEntries = packet.work_order.flatMap((step) => (step.required_gates ?? []).map((gate) => ({ step, gate, evidence: evidence[step.id]?.[gate] })));
  const failedGates = gateEntries.filter((entry) => entry.evidence?.status === 'fail');
  const missingEvidence = gateEntries.filter((entry) => !entry.evidence || entry.evidence.status === 'not_checked' || !entry.evidence.evidence_note.trim());
  const incompleteSteps = packet.work_order.filter((step) => statuses[step.id] !== 'done');
  return {
    objective: packet.objective,
    release_ready: false,
    completed_steps: packet.work_order.filter((step) => statuses[step.id] === 'done').length,
    total_steps: packet.work_order.length,
    blocked_steps: packet.work_order.filter((step) => statuses[step.id] === 'blocked').length,
    incomplete_steps: incompleteSteps.length,
    failed_gates: failedGates.length,
    missing_evidence: missingEvidence.length,
    skills,
    skill_runtime: { active_skills: skills, flags: f, directives: directives(packet), coverage_warnings: coverageWarnings(packet) },
    findings,
    gate_evidence: evidence,
    step_statuses: statuses,
  };
}

function runTrial(config) {
  const packet = makePacket(config);
  const targetStep = packet.work_order[1].id;
  const statuses = { '01-intake': 'done', [targetStep]: 'blocked' };
  const evidence = makeEvidence(packet, config);
  const report = review(packet, config, statuses, evidence);
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
    next_execution_focus: ['Resolve failed gate and missing evidence before release.'],
  };
  const assertions = [
    { name: 'expected skills are selected', pass: config.requiredSkills.every((skill) => report.skills.includes(skill)) },
    { name: 'required skill flags are active', pass: config.requiredFlags.every((flag) => report.skill_runtime.flags[flag] === true) },
    { name: 'release is blocked', pass: report.release_ready === false },
    { name: 'failed gate is visible', pass: report.failed_gates > 0 },
    { name: 'missing evidence is visible', pass: report.missing_evidence > 0 },
    { name: 'blocked step is visible', pass: report.blocked_steps > 0 },
    { name: 'memory packet carries do_not_store', pass: memoryPacket.do_not_store.length > 0 },
    { name: 'context packet preserves blockers', pass: contextPacket.current_blockers.length > 0 && contextPacket.missing_evidence.length > 0 },
  ];
  const summary = {
    trial_id: `${config.id}.skill-aware-run`,
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
  const dir = `generated/trial-runs/${config.id}`;
  ensureDir(dir);
  writeJson(`${dir}/task-packet.json`, packet);
  writeJson(`${dir}/review-report.json`, report);
  writeJson(`${dir}/memory-update-packet.json`, memoryPacket);
  writeJson(`${dir}/context-update-packet.json`, contextPacket);
  writeJson(`${dir}/summary.json`, summary);
  return summary;
}

const summaries = trialConfigs.map(runTrial);
const combined = {
  trial_suite: 'all-skill-aware-trials',
  status: summaries.every((summary) => summary.status === 'pass') ? 'pass' : 'fail',
  summaries,
};
ensureDir('generated/trial-runs');
writeJson('generated/trial-runs/all-skill-trials-summary.json', combined);
console.log(JSON.stringify(combined, null, 2));

if (combined.status !== 'pass') {
  console.error('One or more skill-aware trials failed.');
  process.exit(1);
}
