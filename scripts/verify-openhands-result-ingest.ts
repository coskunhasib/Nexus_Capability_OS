import completedFixture from '../samples/operator-run-results/openhands-completed.sample.json' assert { type: 'json' };
import blockedFixture from '../samples/operator-run-results/openhands-blocked.sample.json' assert { type: 'json' };
import { buildRuntimeAdapterRequest, type TaskPacket } from '../src/runtimeAdapter.ts';
import { isRuntimeAdapterResponse } from '../src/runtimeAdapterProvider.ts';
import {
  isOpenHandsOperatorRunResultFile,
  normalizeOpenHandsOperatorRunResult,
} from '../server/adapters/openhands-result-ingestion.ts';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify OpenHands operator-run result ingestion',
  source_compiler_rule: 'verify-openhands-result-ingest',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['operator-run', 'openhands-result-ingestion'],
    capability_packs: ['openhands-result-ingestion-pack'],
    skills: ['quality-assurance-skill', 'review-skill'],
  },
  skills: [
    { skill: 'quality-assurance-skill', required: true },
    { skill: 'review-skill', required: true },
  ],
  team: [{ profile: 'agent-orchestrator', role: 'owner_or_reviewer' }],
  gates: [
    { gate: 'operator-result-shape', required: true },
    { gate: 'normalization', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-openhands-result',
      title: 'Ingest OpenHands Result',
      owner: 'agent-orchestrator',
      description: 'Normalize an operator-provided OpenHands result file.',
      expected_outputs: ['work_request', 'artifact_manifest'],
      required_gates: ['operator-result-shape', 'normalization'],
      status: 'not_started',
    },
  ],
};

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const request = buildRuntimeAdapterRequest(samplePacket, 'real');
request.request_id = 'operator-run-openhands-fixture';
request.dispatch.target_worker = 'openhands-operator-run';

const completedResponse = normalizeOpenHandsOperatorRunResult(request, completedFixture, {
  target_worker: 'openhands-operator-run',
  now: '2026-05-16T00:00:00.000Z',
});
const blockedResponse = normalizeOpenHandsOperatorRunResult(request, blockedFixture, {
  target_worker: 'openhands-operator-run',
  now: '2026-05-16T00:00:00.000Z',
});

let mismatchRejected = false;
try {
  normalizeOpenHandsOperatorRunResult({ ...request, request_id: 'wrong-request' }, completedFixture, {
    target_worker: 'openhands-operator-run',
  });
} catch {
  mismatchRejected = true;
}

const assertions = [
  assert('completed fixture shape is valid', isOpenHandsOperatorRunResultFile(completedFixture)),
  assert('blocked fixture shape is valid', isOpenHandsOperatorRunResultFile(blockedFixture)),
  assert('completed fixture normalizes to runtime adapter response', isRuntimeAdapterResponse(completedResponse), { status: completedResponse.status }),
  assert('blocked fixture normalizes to runtime adapter response', isRuntimeAdapterResponse(blockedResponse), { status: blockedResponse.status }),
  assert('completed result is accepted', completedResponse.status === 'accepted' && completedResponse.events.some((event) => event.event_type === 'step_completed'), { events: completedResponse.events }),
  assert('completed result emits artifact refs', completedResponse.events.some((event) => (event.artifact_refs ?? []).length === 2), { events: completedResponse.events }),
  assert('blocked result fails closed as step_blocked', blockedResponse.status === 'failed' && blockedResponse.events.some((event) => event.event_type === 'step_blocked'), { events: blockedResponse.events }),
  assert('request id mismatch is rejected', mismatchRejected),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'openhands-result-ingest',
  status,
  assertions,
  response_summary: {
    completed_status: completedResponse.status,
    completed_event_count: completedResponse.events.length,
    blocked_status: blockedResponse.status,
    blocked_event_count: blockedResponse.events.length,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('OpenHands operator-run result ingestion verification failed.');
  process.exit(1);
}
