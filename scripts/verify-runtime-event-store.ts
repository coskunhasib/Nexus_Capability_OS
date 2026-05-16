import { buildMockRuntimeCallbackPayload, buildRuntimeAdapterRequest, runMockRuntimeAdapter, type EvidenceState, type TaskPacket, type WorkStatus } from '../src/runtimeAdapter.ts';
import { appendRuntimeEvents, createRuntimeEventStore, replayRuntimeEventStore, runtimeEventStoreTimeline, summarizeRuntimeEventStore } from '../src/runtimeEventStore.ts';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify runtime event store',
  source_compiler_rule: 'rule-runtime-event-store',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['runtime-adapter'],
    capability_packs: ['runtime-adapter-pack'],
    skills: ['quality-assurance-skill'],
  },
  skills: [{ skill: 'quality-assurance-skill', required: true }],
  team: [{ profile: 'runtime-adapter-engineer', role: 'owner_or_reviewer' }],
  gates: [{ gate: 'runtime-event-coverage', required: true }],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-store',
      title: 'Store Runtime Events',
      owner: 'runtime-adapter-engineer',
      description: 'Store runtime events in an append-only event store.',
      expected_outputs: ['runtime_event_store'],
      required_gates: ['runtime-event-coverage'],
      status: 'not_started',
    },
    {
      order: 2,
      id: '02-replay',
      title: 'Replay Runtime Events',
      owner: 'runtime-adapter-engineer',
      description: 'Replay stored runtime events into Runner state.',
      expected_outputs: ['runtime_event_replay'],
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
      Object.fromEntries((step.required_gates ?? []).map((gate) => [gate, { status: 'not_checked' as const, evidence_note: '', blocker_reason: '' }])),
    ]),
  ) as EvidenceState;
}

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const request = buildRuntimeAdapterRequest(samplePacket, 'mock');
const response = runMockRuntimeAdapter(request);
const callback = buildMockRuntimeCallbackPayload(request, response, 7);
const createdAt = '2026-05-15T00:00:00.000Z';
const store0 = createRuntimeEventStore(request.request_id, response.job.job_id, createdAt);
const initialAppend = appendRuntimeEvents(store0, response.events, 'adapter_response', createdAt);
const callbackAppend = appendRuntimeEvents(initialAppend.store, callback.events, 'callback', callback.received_at);
const repeatAppend = appendRuntimeEvents(callbackAppend.store, callback.events, 'callback', callback.received_at);
const replay = replayRuntimeEventStore(repeatAppend.store, initialStatuses(samplePacket), initialEvidence(samplePacket));
const timeline = runtimeEventStoreTimeline(repeatAppend.store);
const summary = summarizeRuntimeEventStore(repeatAppend.store);

const assertions = [
  assert('store starts empty', store0.entries.length === 0 && store0.repeated.length === 0, { entries: store0.entries.length, repeated: store0.repeated.length }),
  assert('initial append stores adapter response events', initialAppend.entries.length === response.events.length, { stored: initialAppend.entries.length, response_events: response.events.length }),
  assert('initial append has no repeats', initialAppend.repeated.length === 0, { repeated: initialAppend.repeated.length }),
  assert('callback append stores callback event', callbackAppend.entries.length === callback.events.length, { stored: callbackAppend.entries.length, callback_events: callback.events.length }),
  assert('repeat append detects duplicate event', repeatAppend.entries.length === callbackAppend.store.entries.length && repeatAppend.repeated.length === 1, { entries: repeatAppend.entries.length, repeated: repeatAppend.repeated.length }),
  assert('summary counts entries', summary.entry_count === response.events.length + callback.events.length, { summary }),
  assert('summary counts repeat', summary.repeated_count === 1, { summary }),
  assert('summary separates sources', summary.adapter_response_count === response.events.length && summary.callback_count === callback.events.length, { summary }),
  assert('timeline length matches stored entries', timeline.length === summary.entry_count, { timeline_length: timeline.length, entry_count: summary.entry_count }),
  assert('timeline is ordered', timeline.every((entry, index) => entry.sequence === index + 1), { timeline }),
  assert('replay applies all stored events', replay.applied_events.length === summary.entry_count, { applied: replay.applied_events.length, entry_count: summary.entry_count }),
  assert('replay updates first step', replay.statuses['01-store'] === 'done', { status: replay.statuses['01-store'] }),
  assert('replay updates second step after callback', replay.statuses['02-replay'] === 'done', { status: replay.statuses['02-replay'] }),
  assert('replay summary matches store summary', replay.summary.entry_count === summary.entry_count && replay.summary.repeated_count === summary.repeated_count, { replay_summary: replay.summary, summary }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'runtime-event-store',
  status,
  assertions,
  summary,
  timeline,
  replay: {
    applied_events: replay.applied_events.length,
    statuses: replay.statuses,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Runtime event store verification failed.');
  process.exit(1);
}
