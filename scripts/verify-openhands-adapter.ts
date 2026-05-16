import { buildRuntimeAdapterRequest, type TaskPacket } from '../src/runtimeAdapter.ts';
import { isRuntimeAdapterResponse } from '../src/runtimeAdapterProvider.ts';
import {
  buildOpenHandsWorkRequest,
  createOpenHandsAdapterDryRun,
  isOpenHandsWorkRequest,
  normalizeOpenHandsResult,
  type OpenHandsResult,
} from '../server/adapters/openhands-adapter.ts';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify OpenHands adapter envelope',
  source_compiler_rule: 'verify-openhands-adapter',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['agentic-system', 'openhands-adapter'],
    capability_packs: ['openhands-adapter-pack'],
    skills: ['quality-assurance-skill', 'review-skill'],
  },
  skills: [
    { skill: 'quality-assurance-skill', required: true },
    { skill: 'review-skill', required: true },
  ],
  team: [{ profile: 'agent-orchestrator', role: 'owner_or_reviewer' }],
  gates: [
    { gate: 'adapter-envelope', required: true },
    { gate: 'secret-boundary', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-openhands-envelope',
      title: 'Prepare OpenHands Envelope',
      owner: 'agent-orchestrator',
      description: 'Build a safe adapter envelope for OpenHands runtime handoff.',
      expected_outputs: ['work_request', 'artifact_manifest'],
      required_gates: ['adapter-envelope', 'secret-boundary'],
      status: 'not_started',
    },
  ],
};

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const request = buildRuntimeAdapterRequest(samplePacket, 'real');
const workRequest = buildOpenHandsWorkRequest(request, {
  target_worker: 'openhands-adapter-test',
  now: '2026-05-16T00:00:00.000Z',
});
const dryRun = createOpenHandsAdapterDryRun(request, {
  target_worker: 'openhands-adapter-test',
  now: '2026-05-16T00:00:00.000Z',
});
const blockedResult: OpenHandsResult = {
  status: 'blocked',
  artifacts: [],
  notes: ['Operator runtime did not return artifacts.'],
};
const blockedResponse = normalizeOpenHandsResult(request, workRequest, blockedResult, {
  now: '2026-05-16T00:00:00.000Z',
});

const assertions = [
  assert('work request shape is valid', isOpenHandsWorkRequest(workRequest), { packet_type: workRequest.packet_type }),
  assert('workspace does not carry secrets', workRequest.workspace.secret_policy === 'do_not_send_secrets'),
  assert('adapter does not invoke OpenHands directly', workRequest.safety.adapter_invokes_openhands === false),
  assert('adapter does not request arbitrary command execution', workRequest.safety.arbitrary_command_execution === false),
  assert('instructions are derived from work order', workRequest.instructions.length === samplePacket.work_order.length, { instructions: workRequest.instructions }),
  assert('artifact expectations are derived from expected outputs', workRequest.expected_artifacts.length === 2, { expected_artifacts: workRequest.expected_artifacts }),
  assert('dry run returns runtime adapter response', isRuntimeAdapterResponse(dryRun.runtime_response), { status: dryRun.runtime_response.status }),
  assert('dry run emits artifact refs', dryRun.runtime_response.events.some((event) => (event.artifact_refs ?? []).length > 0), { events: dryRun.runtime_response.events }),
  assert('blocked result normalizes to failed runtime response', blockedResponse.status === 'failed' && blockedResponse.events.some((event) => event.event_type === 'step_blocked'), { status: blockedResponse.status, events: blockedResponse.events }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'openhands-adapter',
  status,
  assertions,
  work_request_summary: {
    instruction_count: workRequest.instructions.length,
    artifact_expectation_count: workRequest.expected_artifacts.length,
    secret_policy: workRequest.workspace.secret_policy,
    adapter_invokes_openhands: workRequest.safety.adapter_invokes_openhands,
  },
  runtime_response_summary: {
    dry_run_status: dryRun.runtime_response.status,
    dry_run_event_count: dryRun.runtime_response.events.length,
    blocked_status: blockedResponse.status,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('OpenHands adapter verification failed.');
  process.exit(1);
}
