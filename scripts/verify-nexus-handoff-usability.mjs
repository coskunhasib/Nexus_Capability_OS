import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const generatedRoot = path.join(root, 'generated', 'trial-runs');
const samplesRoot = path.join(root, 'samples', 'handoff-results');

const trialIds = ['web-saas-mvp', 'agentic-system', 'stm32-firmware', 'rfq-generation', 'technical-report'];
const defaultCallbackEvents = ['step_started', 'step_completed', 'step_blocked', 'gate_checked', 'artifact_created', 'runtime_failed'];
const defaultCallbackPayloads = ['step_status', 'gate_evidence', 'artifact_refs', 'blocker_reason', 'missing_evidence'];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function taskSkills(taskPacket) {
  return unique([...(taskPacket.routing?.skills ?? []), ...(taskPacket.skills ?? []).map((item) => item.skill)]);
}

function requiredToolsFor(taskPacket, report, memoryPacket, contextPacket) {
  const tools = new Set(['runtime-bridge', 'artifact-reporter', 'gate-evidence-reporter', 'review-reporter']);
  if (taskSkills(taskPacket).includes('memory-skill')) tools.add('memory-writer');
  if (taskSkills(taskPacket).includes('context-mode-skill')) tools.add('context-compact-reporter');
  if (taskSkills(taskPacket).includes('quality-assurance-skill')) tools.add('evidence-checker');
  if (taskSkills(taskPacket).includes('ultrareview-skill')) tools.add('risk-reviewer');
  if ((report?.missing_evidence ?? 0) > 0 || (contextPacket?.missing_evidence ?? []).length > 0) tools.add('missing-evidence-tracker');
  if ((memoryPacket?.unresolved_blockers ?? []).length > 0 || (contextPacket?.current_blockers ?? []).length > 0) tools.add('blocker-tracker');
  return Array.from(tools);
}

function artifactOutputsFor(taskPacket, report) {
  return unique([
    ...taskPacket.work_order.flatMap((step) => step.expected_outputs ?? []),
    'review_report',
    'memory_update_packet',
    'context_update_packet',
    report?.release_ready ? 'release_notes' : 'blocker_resolution_plan',
  ]);
}

function buildHandoff(trialId, taskPacket, report, memoryPacket, contextPacket) {
  const skills = taskSkills(taskPacket);
  const blockers = unique([
    ...(memoryPacket.unresolved_blockers ?? []).map((item) => item.message || item.type || item.step_id),
    ...(contextPacket.current_blockers ?? []).map((item) => item.message || item.type || item.step_id),
  ]);
  const missingEvidence = unique([
    ...(contextPacket.missing_evidence ?? []).map((item) => `${item.step_id ?? 'unknown'}:${item.gate ?? 'unknown'}`),
    ...(report.findings ?? []).filter((finding) => finding.type === 'missing_evidence').map((finding) => `${finding.step_id ?? 'unknown'}:${finding.gate ?? 'unknown'}`),
  ]);

  return {
    packet_type: 'nexus.handoff_packet',
    version: '0.1',
    objective: taskPacket.objective,
    trial_id: trialId,
    capability_os: {
      compiler_rule: taskPacket.source_compiler_rule ?? `trial-${trialId}`,
      macro_pipeline: taskPacket.routing?.macro_pipeline ?? 'unspecified',
      memory_policy: taskPacket.policies?.memory ?? 'unspecified',
      context_policy: taskPacket.policies?.context ?? 'unspecified',
    },
    selected_capability: {
      pack_id: taskPacket.routing?.capability_packs?.[0] ?? 'unspecified',
      profiles: (taskPacket.team ?? []).map((item) => item.profile),
      skills,
      micro_pipelines: taskPacket.routing?.micro_pipelines ?? [],
      gates: unique([...(taskPacket.gates ?? []).map((item) => item.gate), ...taskPacket.work_order.flatMap((step) => step.required_gates ?? [])]),
    },
    task_packet: taskPacket,
    runtime_requirements: {
      target_runtime: 'nexus-worker',
      required_tools: requiredToolsFor(taskPacket, report, memoryPacket, contextPacket),
      required_skills: skills,
      artifact_outputs: artifactOutputsFor(taskPacket, report),
    },
    execution_context: {
      release_ready: report.release_ready,
      blockers,
      missing_evidence: missingEvidence,
      next_execution_focus: contextPacket.next_execution_focus ?? [],
      current_blockers: contextPacket.current_blockers ?? [],
      step_statuses: report.step_statuses ?? {},
      gate_evidence: report.gate_evidence ?? {},
    },
    callback_contract: {
      expected_events: defaultCallbackEvents,
      required_payloads: defaultCallbackPayloads,
    },
  };
}

function assertHandoff(handoff) {
  const assertions = [
    { name: 'objective is present', pass: Boolean(handoff.objective && handoff.objective.length > 3) },
    { name: 'selected capability has pack id', pass: handoff.selected_capability.pack_id !== 'unspecified' },
    { name: 'selected capability has profiles', pass: handoff.selected_capability.profiles.length > 0 },
    { name: 'required skills are present', pass: handoff.runtime_requirements.required_skills.length > 0 },
    { name: 'required tools are present', pass: handoff.runtime_requirements.required_tools.length >= 4 },
    { name: 'artifact outputs are concrete', pass: handoff.runtime_requirements.artifact_outputs.length >= 4 },
    { name: 'callback events are sufficient', pass: ['step_started', 'step_completed', 'step_blocked', 'gate_checked', 'artifact_created'].every((event) => handoff.callback_contract.expected_events.includes(event)) },
    { name: 'callback payloads are sufficient', pass: ['step_status', 'gate_evidence', 'artifact_refs', 'blocker_reason'].every((payload) => handoff.callback_contract.required_payloads.includes(payload)) },
    { name: 'blockers are carried when not release ready', pass: handoff.execution_context.release_ready || handoff.execution_context.blockers.length > 0 },
    { name: 'missing evidence is carried when not release ready', pass: handoff.execution_context.release_ready || handoff.execution_context.missing_evidence.length > 0 },
    { name: 'next execution focus is present', pass: handoff.execution_context.next_execution_focus.length > 0 },
    { name: 'step statuses are carried', pass: Object.keys(handoff.execution_context.step_statuses).length > 0 },
    { name: 'gate evidence map is carried', pass: Object.keys(handoff.execution_context.gate_evidence).length > 0 },
  ];
  return {
    status: assertions.every((item) => item.pass) ? 'pass' : 'fail',
    assertions,
  };
}

function runForTrial(trialId) {
  const dir = path.join(generatedRoot, trialId);
  const taskPacket = readJson(path.join(dir, 'task-packet.json'));
  const report = readJson(path.join(dir, 'review-report.json'));
  const memoryPacket = readJson(path.join(dir, 'memory-update-packet.json'));
  const contextPacket = readJson(path.join(dir, 'context-update-packet.json'));
  const handoff = buildHandoff(trialId, taskPacket, report, memoryPacket, contextPacket);
  const result = assertHandoff(handoff);
  const summary = {
    trial_id: `${trialId}.nexus-handoff-usability`,
    scenario_id: trialId,
    status: result.status,
    assertions: result.assertions,
    handoff_summary: {
      objective: handoff.objective,
      pack_id: handoff.selected_capability.pack_id,
      profile_count: handoff.selected_capability.profiles.length,
      required_skill_count: handoff.runtime_requirements.required_skills.length,
      required_tool_count: handoff.runtime_requirements.required_tools.length,
      artifact_output_count: handoff.runtime_requirements.artifact_outputs.length,
      blocker_count: handoff.execution_context.blockers.length,
      missing_evidence_count: handoff.execution_context.missing_evidence.length,
      release_ready: handoff.execution_context.release_ready,
    },
  };
  writeJson(path.join(dir, 'nexus-handoff-packet.json'), handoff);
  writeJson(path.join(dir, 'handoff-usability-summary.json'), summary);
  writeJson(path.join(samplesRoot, trialId, 'handoff-usability-summary.json'), summary);
  return summary;
}

const summaries = trialIds.map(runForTrial);
const suite = {
  suite_id: 'nexus-handoff-usability',
  status: summaries.every((summary) => summary.status === 'pass') ? 'pass' : 'fail',
  summaries,
};
writeJson(path.join(generatedRoot, 'nexus-handoff-usability-summary.json'), suite);
writeJson(path.join(samplesRoot, 'nexus-handoff-usability-summary.json'), suite);

console.log(JSON.stringify(suite, null, 2));

if (suite.status !== 'pass') {
  console.error('Nexus handoff usability verification failed.');
  process.exit(1);
}
