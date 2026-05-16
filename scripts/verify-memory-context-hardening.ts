import { buildHardenedMemoryContextPackets } from '../src/memoryContextHardening.ts';
import { buildHardenedReviewReport } from '../src/reviewReportHardening.ts';
import {
  buildRuntimeAdapterRequest,
  createRuntimeJobState,
  runMockRuntimeAdapter,
  type EvidenceState,
  type TaskPacket,
  type WorkStatus,
} from '../src/runtimeAdapter.ts';
import { buildRuntimeArtifactRegistryFromEvents } from '../src/runtimeArtifactRegistry.ts';

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify memory context hardening',
  source_compiler_rule: 'rule-memory-context-hardening',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['runtime-adapter', 'memory-context'],
    capability_packs: ['memory-context-hardening-pack'],
    skills: ['memory-curation-skill', 'context-management-skill'],
  },
  skills: [
    { skill: 'memory-curation-skill', required: true },
    { skill: 'context-management-skill', required: true },
  ],
  team: [
    { profile: 'memory-curator', role: 'owner_or_reviewer' },
    { profile: 'context-manager', role: 'owner_or_reviewer' },
  ],
  gates: [
    { gate: 'human-proof', required: true },
    { gate: 'runtime-proof', required: true },
    { gate: 'release-readiness', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-human-evidence',
      title: 'Human Evidence',
      owner: 'memory-curator',
      description: 'Collect human accepted decisions.',
      expected_outputs: ['decision_note'],
      required_gates: ['human-proof'],
      status: 'done',
    },
    {
      order: 2,
      id: '02-runtime-evidence',
      title: 'Runtime Evidence',
      owner: 'context-manager',
      description: 'Collect runtime and artifact-backed evidence.',
      expected_outputs: ['runtime_adapter_response', 'artifact_manifest'],
      required_gates: ['runtime-proof'],
      status: 'done',
    },
    {
      order: 3,
      id: '03-release',
      title: 'Release Check',
      owner: 'memory-curator',
      description: 'Check whether memory/context update is safe to persist.',
      expected_outputs: ['memory_update_packet', 'context_update_packet'],
      required_gates: ['release-readiness'],
      status: 'blocked',
    },
  ],
};

const statuses: Record<string, WorkStatus> = {
  '01-human-evidence': 'done',
  '02-runtime-evidence': 'done',
  '03-release': 'blocked',
};

const evidence: EvidenceState = {
  '01-human-evidence': {
    'human-proof': {
      status: 'pass',
      evidence_note: 'Product owner accepted the decision summary and follow-up framing.',
      blocker_reason: '',
    },
  },
  '02-runtime-evidence': {
    'runtime-proof': {
      status: 'pass',
      evidence_note: 'Runtime adapter artifact://mock/memory-context/log verified by CI.',
      blocker_reason: '',
    },
  },
  '03-release': {
    'release-readiness': {
      status: 'fail',
      evidence_note: '',
      blocker_reason: 'Do-not-store policy still needs operator review before release.',
    },
  },
};

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const request = buildRuntimeAdapterRequest(samplePacket, 'mock');
const response = runMockRuntimeAdapter(request);
const job = createRuntimeJobState(request, response, 'mock-provider');
const registry = buildRuntimeArtifactRegistryFromEvents(response.events);
const report = buildHardenedReviewReport(samplePacket, statuses, evidence, registry);
const packets = buildHardenedMemoryContextPackets(samplePacket, report, {
  job,
  artifactRegistry: registry,
  generatedAt: '2026-05-16T00:00:00.000Z',
  maxContextItems: 5,
});

const memory = packets.memory_update_packet;
const context = packets.context_update_packet;

const assertions = [
  assert('memory packet version is hardened', memory.packet_type === 'nexus.memory_update_packet' && memory.version === '0.2', { packet_type: memory.packet_type, version: memory.version }),
  assert('context packet version is hardened', context.packet_type === 'nexus.context_update_packet' && context.version === '0.2', { packet_type: context.packet_type, version: context.version }),
  assert('accepted decisions include human evidence', memory.accepted_decisions.some((item) => item.source === 'human_evidence'), { decisions: memory.accepted_decisions }),
  assert('accepted decisions include runtime evidence', memory.accepted_decisions.some((item) => item.source === 'runtime_evidence'), { decisions: memory.accepted_decisions }),
  assert('artifact summaries are summary/ref only', memory.artifact_summaries.length > 0 && memory.artifact_summaries.every((item) => item.store_policy === 'summary_and_ref_only'), { artifact_summaries: memory.artifact_summaries }),
  assert('runtime blockers are persisted as summaries', memory.runtime_blockers.length >= 2, { runtime_blockers: memory.runtime_blockers }),
  assert('open questions are derived from blockers', memory.open_questions.length === memory.runtime_blockers.length, { open_questions: memory.open_questions, blockers: memory.runtime_blockers }),
  assert('provider job metadata is carried forward', memory.provider_job_metadata.job_id === job.job_id && memory.provider_job_metadata.event_count === job.events.length, { metadata: memory.provider_job_metadata, job_id: job.job_id, event_count: job.events.length }),
  assert('do-not-store policy excludes raw payloads', memory.do_not_store.excluded_fields.includes('raw_runtime_events') && memory.do_not_store.excluded_fields.includes('raw_callback_payloads'), { do_not_store: memory.do_not_store }),
  assert('next run context starts at first blocker', context.next_run_context.recommended_start_step === memory.runtime_blockers[0]?.step_id, { next_run_context: context.next_run_context, blockers: memory.runtime_blockers }),
  assert('next run context carries bounded followups', context.next_run_context.required_followups.length <= 5 && context.next_run_context.max_context_items === 5, { next_run_context: context.next_run_context }),
  assert('context and memory share unresolved blockers', context.unresolved_blockers.length === memory.runtime_blockers.length, { context_blockers: context.unresolved_blockers, memory_blockers: memory.runtime_blockers }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'memory-context-hardening',
  status,
  assertions,
  memory_summary: {
    accepted_decisions: memory.accepted_decisions.length,
    runtime_blockers: memory.runtime_blockers.length,
    artifact_summaries: memory.artifact_summaries.length,
    open_questions: memory.open_questions.length,
    provider_job_status: memory.provider_job_metadata.status,
  },
  context_summary: {
    recommended_start_step: context.next_run_context.recommended_start_step,
    carry_forward_decisions: context.next_run_context.carry_forward_decisions.length,
    carry_forward_artifacts: context.next_run_context.carry_forward_artifacts.length,
    required_followups: context.next_run_context.required_followups.length,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Memory/context hardening verification failed.');
  process.exit(1);
}
