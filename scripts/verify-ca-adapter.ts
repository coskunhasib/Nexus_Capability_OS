import { buildRuntimeAdapterRequest, type TaskPacket } from '../src/runtimeAdapter.ts';
import { isRuntimeAdapterResponse } from '../src/runtimeAdapterProvider.ts';
import {
  buildCodeAgentWorkRequest,
  createCodeAgentAdapterDryRun,
  isCodeAgentWorkRequest,
  normalizeCodeAgentResult,
  type CodeAgentKind,
  type CodeAgentResult,
} from '../server/adapters/code-agent-adapter.ts';

const agentA: CodeAgentKind = 'codex';
const agentB: CodeAgentKind = 'claude-code';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify code agent adapter envelope',
  source_compiler_rule: 'verify-code-agent-adapter',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['agentic-system', 'code-agent-adapter'],
    capability_packs: ['code-agent-adapter-pack'],
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
      id: '01-code-agent-envelope',
      title: 'Prepare Code Agent Envelope',
      owner: 'agent-orchestrator',
      description: 'Build a safe adapter envelope for a code-agent runtime handoff.',
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
const workRequestA = buildCodeAgentWorkRequest(request, { agent_kind: agentA, target_worker: 'agent-a-test', now: '2026-05-16T00:00:00.000Z' });
const workRequestB = buildCodeAgentWorkRequest(request, { agent_kind: agentB, target_worker: 'agent-b-test', now: '2026-05-16T00:00:00.000Z' });
const dryRunA = createCodeAgentAdapterDryRun(request, { agent_kind: agentA, target_worker: 'agent-a-test', now: '2026-05-16T00:00:00.000Z' });
const dryRunB = createCodeAgentAdapterDryRun(request, { agent_kind: agentB, target_worker: 'agent-b-test', now: '2026-05-16T00:00:00.000Z' });
const blockedResult: CodeAgentResult = {
  status: 'blocked',
  artifacts: [],
  notes: ['Operator runtime did not return artifacts.'],
};
const blockedResponse = normalizeCodeAgentResult(request, workRequestA, blockedResult, { now: '2026-05-16T00:00:00.000Z' });

const assertions = [
  assert('agent A work request shape is valid', isCodeAgentWorkRequest(workRequestA), { agent_kind: workRequestA.agent_kind }),
  assert('agent B work request shape is valid', isCodeAgentWorkRequest(workRequestB), { agent_kind: workRequestB.agent_kind }),
  assert('workspace does not carry secrets', workRequestA.workspace.secret_policy === 'do_not_send_secrets' && workRequestB.workspace.secret_policy === 'do_not_send_secrets'),
  assert('adapter does not invoke agents directly', workRequestA.safety.adapter_invokes_agent === false && workRequestB.safety.adapter_invokes_agent === false),
  assert('adapter does not request arbitrary command execution', workRequestA.safety.arbitrary_command_execution === false && workRequestB.safety.arbitrary_command_execution === false),
  assert('prompt sections are derived from work order', workRequestA.prompt_sections.length === samplePacket.work_order.length, { prompt_sections: workRequestA.prompt_sections }),
  assert('artifact expectations are derived from expected outputs', workRequestA.expected_artifacts.length === 2, { expected_artifacts: workRequestA.expected_artifacts }),
  assert('agent A dry run returns runtime adapter response', isRuntimeAdapterResponse(dryRunA.runtime_response), { status: dryRunA.runtime_response.status }),
  assert('agent B dry run returns runtime adapter response', isRuntimeAdapterResponse(dryRunB.runtime_response), { status: dryRunB.runtime_response.status }),
  assert('dry runs emit artifact refs', dryRunA.runtime_response.events.some((event) => (event.artifact_refs ?? []).length > 0) && dryRunB.runtime_response.events.some((event) => (event.artifact_refs ?? []).length > 0)),
  assert('blocked result normalizes to failed runtime response', blockedResponse.status === 'failed' && blockedResponse.events.some((event) => event.event_type === 'step_blocked'), { status: blockedResponse.status, events: blockedResponse.events }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'code-agent-adapter',
  status,
  assertions,
  work_request_summary: {
    supported_agents: [workRequestA.agent_kind, workRequestB.agent_kind],
    prompt_section_count: workRequestA.prompt_sections.length,
    artifact_expectation_count: workRequestA.expected_artifacts.length,
    secret_policy: workRequestA.workspace.secret_policy,
    adapter_invokes_agent: workRequestA.safety.adapter_invokes_agent,
  },
  runtime_response_summary: {
    agent_a_status: dryRunA.runtime_response.status,
    agent_b_status: dryRunB.runtime_response.status,
    blocked_status: blockedResponse.status,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Code agent adapter verification failed.');
  process.exit(1);
}
