import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const generatedRoot = path.join(root, 'generated', 'trial-runs');
const samplesRoot = path.join(root, 'samples', 'runtime-bridge-results');
const trialIds = ['web-saas-mvp', 'agentic-system', 'stm32-firmware', 'rfq-generation', 'technical-report'];
const timestamp = '2026-05-15T00:00:00.000Z';

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

function getStepStatus(handoff, step) {
  const statuses = handoff.execution_context?.step_statuses ?? handoff.task_packet?.step_statuses ?? {};
  return statuses[step.id] ?? step.status ?? 'not_started';
}

function gatesForStep(handoff, step) {
  const evidence = handoff.task_packet?.gate_evidence?.[step.id] ?? handoff.execution_context?.gate_evidence?.[step.id] ?? {};
  return (step.required_gates ?? []).map((gate) => {
    const item = evidence[gate] ?? {};
    return {
      gate,
      status: item.status ?? 'not_checked',
      evidence_note: item.evidence_note ?? '',
      blocker_reason: item.blocker_reason ?? '',
    };
  });
}

function artifactRefsFor(handoff, step) {
  const outputs = step.expected_outputs?.length ? step.expected_outputs : handoff.runtime_requirements.artifact_outputs;
  return outputs.slice(0, 4).map((kind) => ({
    kind,
    ref: `artifact://${handoff.trial_id}/${step.id}/${kind}`,
    summary: `${kind} produced or expected for ${step.title}`,
  }));
}

function simulateEvents(handoff) {
  const events = [];
  const taskId = handoff.trial_id ?? handoff.objective;
  for (const step of handoff.task_packet.work_order ?? []) {
    const status = getStepStatus(handoff, step);
    events.push({
      event_type: 'step_started',
      version: '0.1',
      task_packet_id: taskId,
      step_id: step.id,
      status: status === 'not_started' ? 'in_progress' : status,
      timestamp,
      owner: step.owner,
      runtime_notes: `Nexus mock worker started ${step.title}`,
    });
    const gateEvidence = gatesForStep(handoff, step);
    if (gateEvidence.length) {
      events.push({
        event_type: 'gate_checked',
        version: '0.1',
        task_packet_id: taskId,
        step_id: step.id,
        status,
        timestamp,
        owner: step.owner,
        gate_evidence: gateEvidence,
        runtime_notes: `Gate evidence reported for ${step.title}`,
      });
    }
    if (status === 'done') {
      events.push({
        event_type: 'artifact_created',
        version: '0.1',
        task_packet_id: taskId,
        step_id: step.id,
        status,
        timestamp,
        owner: step.owner,
        artifact_refs: artifactRefsFor(handoff, step),
        runtime_notes: `Artifacts created for ${step.title}`,
      });
      events.push({
        event_type: 'step_completed',
        version: '0.1',
        task_packet_id: taskId,
        step_id: step.id,
        status,
        timestamp,
        owner: step.owner,
        artifact_refs: artifactRefsFor(handoff, step),
        runtime_notes: `Step completed: ${step.title}`,
      });
    } else if (status === 'blocked') {
      const blocker = (handoff.execution_context?.current_blockers ?? []).find((item) => item.step_id === step.id) ?? handoff.execution_context?.current_blockers?.[0];
      events.push({
        event_type: 'step_blocked',
        version: '0.1',
        task_packet_id: taskId,
        step_id: step.id,
        status: 'blocked',
        timestamp,
        owner: step.owner,
        blocker_reason: blocker?.message ?? blocker?.type ?? 'Step blocked by unresolved gate or missing evidence.',
        runtime_notes: `Step blocked: ${step.title}`,
      });
    }
  }
  return events;
}

function payloadCoverage(events) {
  return {
    step_status: events.every((event) => Boolean(event.status)),
    gate_evidence: events.some((event) => Array.isArray(event.gate_evidence) && event.gate_evidence.length > 0),
    artifact_refs: events.some((event) => Array.isArray(event.artifact_refs) && event.artifact_refs.length > 0),
    blocker_reason: events.some((event) => typeof event.blocker_reason === 'string' && event.blocker_reason.length > 0),
    missing_evidence: events.some((event) => (event.gate_evidence ?? []).some((gate) => gate.status === 'not_checked' || !gate.evidence_note)),
  };
}

function assertRuntimeBridge(handoff, events) {
  const expectedEvents = handoff.callback_contract.expected_events ?? [];
  const requiredPayloads = handoff.callback_contract.required_payloads ?? [];
  const eventTypes = unique(events.map((event) => event.event_type));
  const coverage = payloadCoverage(events);
  const assertions = [
    { name: 'event stream is not empty', pass: events.length > 0 },
    { name: 'all events have required base fields', pass: events.every((event) => event.event_type && event.version === '0.1' && event.task_packet_id && event.step_id && event.status && event.timestamp) },
    { name: 'step_started is emitted', pass: eventTypes.includes('step_started') },
    { name: 'gate_checked is emitted', pass: eventTypes.includes('gate_checked') },
    { name: 'artifact_created or step_completed is emitted for done work', pass: eventTypes.includes('artifact_created') || eventTypes.includes('step_completed') },
    { name: 'step_blocked is emitted when blockers exist', pass: (handoff.execution_context.blockers ?? []).length === 0 || eventTypes.includes('step_blocked') },
    { name: 'callback expected events covered enough', pass: ['step_started', 'gate_checked'].every((event) => eventTypes.includes(event)) && expectedEvents.includes('step_blocked') },
    { name: 'required payload step_status covered', pass: !requiredPayloads.includes('step_status') || coverage.step_status },
    { name: 'required payload gate_evidence covered', pass: !requiredPayloads.includes('gate_evidence') || coverage.gate_evidence },
    { name: 'required payload artifact_refs covered', pass: !requiredPayloads.includes('artifact_refs') || coverage.artifact_refs },
    { name: 'required payload blocker_reason covered', pass: !requiredPayloads.includes('blocker_reason') || coverage.blocker_reason },
    { name: 'missing evidence is surfaced', pass: !requiredPayloads.includes('missing_evidence') || coverage.missing_evidence },
  ];
  return {
    status: assertions.every((item) => item.pass) ? 'pass' : 'fail',
    assertions,
    event_types: eventTypes,
    payload_coverage: coverage,
  };
}

function runForTrial(trialId) {
  const dir = path.join(generatedRoot, trialId);
  const handoffPath = path.join(dir, 'nexus-handoff-packet.json');
  if (!fs.existsSync(handoffPath)) throw new Error(`Missing handoff packet for ${trialId}. Run verify:handoff first.`);
  const handoff = readJson(handoffPath);
  const events = simulateEvents(handoff);
  const result = assertRuntimeBridge(handoff, events);
  const summary = {
    trial_id: `${trialId}.nexus-runtime-bridge`,
    scenario_id: trialId,
    status: result.status,
    assertions: result.assertions,
    event_count: events.length,
    event_types: result.event_types,
    payload_coverage: result.payload_coverage,
  };
  writeJson(path.join(dir, 'runtime-bridge-events.json'), { events });
  writeJson(path.join(dir, 'runtime-bridge-summary.json'), summary);
  writeJson(path.join(samplesRoot, trialId, 'runtime-bridge-summary.json'), summary);
  return summary;
}

const summaries = trialIds.map(runForTrial);
const suite = {
  suite_id: 'nexus-runtime-bridge',
  status: summaries.every((summary) => summary.status === 'pass') ? 'pass' : 'fail',
  summaries,
};
writeJson(path.join(generatedRoot, 'nexus-runtime-bridge-summary.json'), suite);
writeJson(path.join(samplesRoot, 'nexus-runtime-bridge-summary.json'), suite);
console.log(JSON.stringify(suite, null, 2));

if (suite.status !== 'pass') {
  console.error('Nexus runtime bridge verification failed.');
  process.exit(1);
}
