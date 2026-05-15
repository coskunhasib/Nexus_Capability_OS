import {
  applyRuntimeEventsToRunnerState,
  buildMockRuntimeCallbackPayload,
  buildRuntimeAdapterRequest,
  ingestRuntimeCallback,
  runMockRuntimeAdapter,
  summarizeRuntimeAdapterResponse,
  validateRuntimeCallbackPayload,
  type EvidenceState,
  type TaskPacket,
  type WorkStatus,
} from '../src/runtimeAdapter.ts';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify runtime adapter loop',
  source_compiler_rule: 'rule-runtime-adapter-loop',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['runtime-adapter', 'qa-automation'],
    capability_packs: ['runtime-adapter-pack'],
    skills: ['superpowered-planning-skill', 'review-skill', 'quality-assurance-skill'],
  },
  skills: [
    { skill: 'superpowered-planning-skill', required: true },
    { skill: 'review-skill', required: true },
    { skill: 'quality-assurance-skill', required: true },
  ],
  team: [
    { profile: 'runtime-adapter-engineer', role: 'owner_or_reviewer' },
    { profile: 'qa-automation-engineer', role: 'owner_or_reviewer' },
  ],
  gates: [
    { gate: 'adapter-contract-fit', required: true },
    { gate: 'runtime-event-coverage', required: true },
    { gate: 'test-evidence', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-adapter-contract',
      title: 'Adapter Contract Dispatch',
      owner: 'runtime-adapter-engineer',
      description: 'Generate runtime adapter request and dispatch to mock worker.',
      expected_outputs: ['runtime_adapter_request', 'runtime_adapter_response'],
      required_gates: ['adapter-contract-fit', 'test-evidence'],
      status: 'not_started',
    },
    {
      order: 2,
      id: '02-runtime-ingest',
      title: 'Runtime Event Ingest',
      owner: 'qa-automation-engineer',
      description: 'Ingest runtime bridge events into Runner state.',
      expected_outputs: ['runner_state_patch', 'runtime_event_summary'],
      required_gates: ['runtime-event-coverage'],
      status: 'not_started',
    },
  ],
};

function initialStatuses(packet: TaskPacket) {
  return Object.fromEntries(packet.work_order.map((step) => [step.id, step.status ?? 'not_started'])) as Record<string, WorkStatus>;
}

function initialEvidence(packet: TaskPacket): EvidenceState {
  return Object.fromEntries(
    packet.work_order.map((step) => [
      step.id,
      Object.fromEntries(
        (step.required_gates ?? []).map((gate) => [gate, { status: 'not_checked' as const, evidence_note: '', blocker_reason: '' }]),
      ),
    ]),
  ) as EvidenceState;
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

function eventTypes(events: Array<{ event_type: string }>) {
  return Array.from(new Set(events.map((event) => event.event_type)));
}

function verifyHappyPath() {
  const request = buildRuntimeAdapterRequest(samplePacket, 'mock');
  const response = runMockRuntimeAdapter(request);
  const patch = applyRuntimeEventsToRunnerState(initialStatuses(samplePacket), initialEvidence(samplePacket), response.events);
  const summary = summarizeRuntimeAdapterResponse(response);
  const firstStepId = samplePacket.work_order[0].id;
  const firstStepGates = samplePacket.work_order[0].required_gates ?? [];
  const types = eventTypes(response.events);
  const artifactEvent = response.events.find((event) => event.event_type === 'artifact_created');

  return {
    request,
    response,
    patch,
    summary,
    assertions: [
      assert('request packet_type is correct', request.packet_type === 'nexus.runtime_adapter_request', { packet_type: request.packet_type }),
      assert('request carries handoff packet', request.handoff_packet.packet_type === 'nexus.handoff_packet', { handoff_type: request.handoff_packet.packet_type }),
      assert('request dispatch mode is mock', request.dispatch.mode === 'mock', { mode: request.dispatch.mode }),
      assert('response accepted is true', response.accepted === true, { accepted: response.accepted }),
      assert('response status is accepted', response.status === 'accepted', { status: response.status }),
      assert('event stream is not empty', response.events.length > 0, { event_count: response.events.length }),
      assert('step_started event exists', types.includes('step_started'), { event_types: types }),
      assert('gate_checked event exists', types.includes('gate_checked'), { event_types: types }),
      assert('artifact_created event exists', types.includes('artifact_created'), { event_types: types }),
      assert('step_completed event exists', types.includes('step_completed'), { event_types: types }),
      assert('runner first step becomes done', patch.statuses[firstStepId] === 'done', { status: patch.statuses[firstStepId] }),
      assert('runner second step starts when present', patch.statuses[samplePacket.work_order[1].id] === 'in_progress', { status: patch.statuses[samplePacket.work_order[1].id] }),
      assert('gate evidence is ingested as pass', firstStepGates.every((gate) => patch.evidence[firstStepId]?.[gate]?.status === 'pass'), { evidence: patch.evidence[firstStepId] }),
      assert('artifact refs are produced', Boolean(artifactEvent?.artifact_refs?.length), { artifact_refs: artifactEvent?.artifact_refs ?? [] }),
      assert('summary reflects event count', summary.event_count === response.events.length, { summary_event_count: summary.event_count, response_event_count: response.events.length }),
    ],
  };
}

function verifyCallbackIngest() {
  const request = buildRuntimeAdapterRequest(samplePacket, 'mock');
  const response = runMockRuntimeAdapter(request);
  const initialPatch = applyRuntimeEventsToRunnerState(initialStatuses(samplePacket), initialEvidence(samplePacket), response.events);
  const seenKeys = response.events.map((event) => event.event_id ?? `${event.event_type}:${event.task_packet_id}:${event.step_id}:${event.status}:${event.timestamp}`);
  const callback = buildMockRuntimeCallbackPayload(request, response, 7);
  const validation = validateRuntimeCallbackPayload(callback);
  const ingest = ingestRuntimeCallback(initialPatch.statuses, initialPatch.evidence, callback, seenKeys);
  const duplicateIngest = ingestRuntimeCallback(ingest.statuses, ingest.evidence, callback, ingest.seen_event_keys);
  const invalidValidation = validateRuntimeCallbackPayload({ ...callback, packet_type: 'wrong.type' });
  const secondStepId = samplePacket.work_order[1].id;

  return {
    callback,
    ingest,
    duplicateIngest,
    validation,
    invalidValidation,
    assertions: [
      assert('callback payload validates', validation.valid === true, { errors: validation.errors }),
      assert('invalid callback payload is rejected', invalidValidation.valid === false && invalidValidation.errors.length > 0, { errors: invalidValidation.errors }),
      assert('callback accepted one new event', ingest.accepted_events.length === 1, { accepted: ingest.accepted_events.length }),
      assert('callback duplicate count is zero on first ingest', ingest.duplicate_events.length === 0, { duplicates: ingest.duplicate_events.length }),
      assert('callback updates runner state', ingest.statuses[secondStepId] === 'done', { status: ingest.statuses[secondStepId] }),
      assert('callback replay is deduped', duplicateIngest.accepted_events.length === 0 && duplicateIngest.duplicate_events.length === 1, { accepted: duplicateIngest.accepted_events.length, duplicates: duplicateIngest.duplicate_events.length }),
      assert('callback seen keys are retained', duplicateIngest.seen_event_keys.length === ingest.seen_event_keys.length, { seen_after_ingest: ingest.seen_event_keys.length, seen_after_replay: duplicateIngest.seen_event_keys.length }),
    ],
  };
}

function verifyRejectPath() {
  const emptyPacket: TaskPacket = {
    ...samplePacket,
    objective: 'Verify empty work order reject path',
    work_order: [],
  };
  const request = buildRuntimeAdapterRequest(emptyPacket, 'mock');
  const response = runMockRuntimeAdapter(request);
  return {
    request,
    response,
    assertions: [
      assert('empty work_order response is rejected', response.accepted === false && response.status === 'rejected', { accepted: response.accepted, status: response.status }),
      assert('empty work_order returns error code', response.error?.code === 'EMPTY_WORK_ORDER', { error: response.error }),
      assert('empty work_order emits no events', response.events.length === 0, { event_count: response.events.length }),
    ],
  };
}

const happyPath = verifyHappyPath();
const callbackIngest = verifyCallbackIngest();
const rejectPath = verifyRejectPath();
const assertions = [...happyPath.assertions, ...callbackIngest.assertions, ...rejectPath.assertions];
const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';

const result = {
  suite_id: 'runtime-adapter-loop',
  status,
  assertions,
  happy_path: {
    request_id: happyPath.request.request_id,
    response_status: happyPath.response.status,
    event_count: happyPath.response.events.length,
    event_types: eventTypes(happyPath.response.events),
    runner_statuses: happyPath.patch.statuses,
    first_step_evidence: happyPath.patch.evidence[samplePacket.work_order[0].id],
  },
  callback_ingest: {
    packet_type: callbackIngest.callback.packet_type,
    event_count: callbackIngest.callback.events.length,
    accepted_events: callbackIngest.ingest.accepted_events.length,
    duplicate_events_on_replay: callbackIngest.duplicateIngest.duplicate_events.length,
    seen_event_keys: callbackIngest.ingest.seen_event_keys.length,
    status_after_callback: callbackIngest.ingest.statuses[samplePacket.work_order[1].id],
  },
  reject_path: {
    request_id: rejectPath.request.request_id,
    response_status: rejectPath.response.status,
    error: rejectPath.response.error,
    event_count: rejectPath.response.events.length,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Runtime adapter loop verification failed.');
  process.exit(1);
}
