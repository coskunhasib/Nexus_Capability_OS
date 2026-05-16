import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildHardenedMemoryContextPackets } from '../src/memoryContextHardening.ts';
import { buildHardenedReviewReport } from '../src/reviewReportHardening.ts';
import {
  applyRuntimeEventsToRunnerState,
  buildRuntimeAdapterRequest,
  createRuntimeJobState,
  runMockRuntimeAdapter,
  type EvidenceState,
  type RuntimeAdapterRequest,
  type RuntimeAdapterResponse,
  type TaskPacket,
  type WorkStatus,
} from '../src/runtimeAdapter.ts';
import { buildRuntimeArtifactRegistryFromEvents } from '../src/runtimeArtifactRegistry.ts';
import { dispatchRuntimeAdapterRequest, RuntimeAdapterProviderError } from '../src/runtimeAdapterProvider.ts';
import { createHttpRuntimeAdapterProvider } from '../src/runtimeAdapters/httpRuntimeAdapterProvider.ts';
import { mockRuntimeAdapterProvider } from '../src/runtimeAdapters/mockRuntimeAdapterProvider.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const generatedAt = '2026-05-16T00:00:00.000Z';

type AdapterTrialConfig = {
  scenario_id: string;
  intent: string;
};

function readJson(relativePath: string) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function ensureDir(relativePath: string) {
  fs.mkdirSync(path.join(root, relativePath), { recursive: true });
}

function writeJson(relativePath: string, data: unknown) {
  fs.writeFileSync(path.join(root, relativePath), `${JSON.stringify(data, null, 2)}\n`);
}

function makeTaskPacket(trialId: string, objective: string): TaskPacket {
  return {
    packet_type: 'nexus.task_packet',
    version: '0.1',
    objective,
    source_compiler_rule: `adapter-trial-${trialId}`,
    routing: {
      macro_pipeline: 'software-development',
      micro_pipelines: ['runtime-adapter', 'review-hardening', 'memory-context'],
      capability_packs: ['adapter-trial-pack'],
      skills: ['quality-assurance-skill', 'review-skill', 'memory-skill', 'context-mode-skill'],
    },
    skills: [
      { skill: 'quality-assurance-skill', required: true },
      { skill: 'review-skill', required: true },
      { skill: 'memory-skill', required: true },
      { skill: 'context-mode-skill', required: true },
    ],
    team: [
      { profile: 'runtime-adapter-engineer', role: 'owner_or_reviewer' },
      { profile: 'qa-automation-engineer', role: 'owner_or_reviewer' },
      { profile: 'memory-curator', role: 'owner_or_reviewer' },
    ],
    gates: [
      { gate: 'adapter-response', required: true },
      { gate: 'artifact-ref', required: true },
      { gate: 'memory-context-continuity', required: true },
    ],
    policies: {
      memory: 'project-decision-memory',
      context: 'software-working-set-context',
    },
    work_order: [
      {
        order: 1,
        id: '01-dispatch',
        title: 'Dispatch Runtime Adapter Request',
        owner: 'runtime-adapter-engineer',
        description: 'Dispatch a runtime adapter request through the selected provider.',
        expected_outputs: ['runtime_adapter_response', 'runtime_bridge_events'],
        required_gates: ['adapter-response', 'artifact-ref'],
        status: 'not_started',
      },
      {
        order: 2,
        id: '02-review-memory-context',
        title: 'Review To Memory Context Continuity',
        owner: 'memory-curator',
        description: 'Convert runtime evidence and review buckets into memory/context packets.',
        expected_outputs: ['hardened_review_report', 'memory_update_packet', 'context_update_packet'],
        required_gates: ['memory-context-continuity'],
        status: 'not_started',
      },
    ],
  };
}

function initialEvidence(packet: TaskPacket): EvidenceState {
  return Object.fromEntries(
    packet.work_order.map((step) => [
      step.id,
      Object.fromEntries((step.required_gates ?? []).map((gate) => [gate, { status: 'not_checked', evidence_note: '', blocker_reason: '' }])),
    ]),
  ) as EvidenceState;
}

function initialStatuses(packet: TaskPacket): Record<string, WorkStatus> {
  return Object.fromEntries(packet.work_order.map((step) => [step.id, 'not_started'])) as Record<string, WorkStatus>;
}

function normalizeResponseTimes(response: RuntimeAdapterResponse): RuntimeAdapterResponse {
  return {
    ...response,
    job: {
      ...response.job,
      started_at: generatedAt,
      estimated_next_callback: generatedAt,
    },
    events: response.events.map((event, index) => ({
      ...event,
      timestamp: `2026-05-16T00:00:0${index}.000Z`,
    })),
  };
}

function buildReviewAndMemory(packet: TaskPacket, providerId: string, request: RuntimeAdapterRequest, response: RuntimeAdapterResponse) {
  const normalizedResponse = normalizeResponseTimes(response);
  const patch = applyRuntimeEventsToRunnerState(initialStatuses(packet), initialEvidence(packet), normalizedResponse.events);
  const job = createRuntimeJobState(request, normalizedResponse, providerId);
  const registry = buildRuntimeArtifactRegistryFromEvents(normalizedResponse.events, generatedAt);
  const report = buildHardenedReviewReport(packet, patch.statuses, patch.evidence, registry);
  const memoryContext = buildHardenedMemoryContextPackets(packet, report, {
    job,
    artifactRegistry: registry,
    generatedAt,
    maxContextItems: 8,
  });
  return { patch, job, registry, report, memoryContext, response: normalizedResponse };
}

function pass(name: string, passValue: boolean, details?: Record<string, unknown>) {
  return { name, pass: passValue, details };
}

async function runMockAdapterTrial() {
  const config = readJson('samples/trials/adapter-mock-runtime.trial.json') as AdapterTrialConfig;
  const packet = makeTaskPacket(config.scenario_id, config.intent);
  const request = buildRuntimeAdapterRequest(packet, 'mock');
  const response = await dispatchRuntimeAdapterRequest(mockRuntimeAdapterProvider, request);
  const built = buildReviewAndMemory(packet, 'mock', request, response);

  const assertions = [
    pass('adapter response accepted', built.response.accepted === true && built.response.status === 'accepted'),
    pass('runtime job created', built.job.job_id.length > 0 && built.job.provider_id === 'mock'),
    pass('artifacts collected', built.registry.artifacts.length > 0 && built.report.artifact_backed_evidence.length > 0),
    pass('hardened review created', built.report.counts.required_gates > 0 && built.report.counts.release_blockers > 0),
    pass('memory context created', built.memoryContext.memory_update_packet.accepted_decisions.length > 0 && built.memoryContext.context_update_packet.next_run_context.required_followups.length > 0),
    pass('do-not-store policy present', built.memoryContext.memory_update_packet.do_not_store.excluded_fields.includes('raw_runtime_events')),
  ];

  return {
    trial_id: config.scenario_id,
    provider: 'mock',
    status: assertions.every((item) => item.pass) ? 'pass' : 'fail',
    assertions,
    runtime_job_summary: {
      job_id: built.job.job_id,
      status: built.job.status,
      event_count: built.job.events.length,
      artifact_count: built.job.artifacts.length,
      callback_count: built.job.callbacks.received,
    },
    review_summary: built.report.counts,
    memory_summary: {
      accepted_decisions: built.memoryContext.memory_update_packet.accepted_decisions.length,
      runtime_blockers: built.memoryContext.memory_update_packet.runtime_blockers.length,
      artifact_summaries: built.memoryContext.memory_update_packet.artifact_summaries.length,
      open_questions: built.memoryContext.memory_update_packet.open_questions.length,
    },
  };
}

function responseFromRequest(request: RuntimeAdapterRequest) {
  return normalizeResponseTimes(runMockRuntimeAdapter(request));
}

async function runHttpAdapterDryRunTrial() {
  const config = readJson('samples/trials/adapter-http-dry-run.trial.json') as AdapterTrialConfig;
  const packet = makeTaskPacket(config.scenario_id, config.intent);
  const request = buildRuntimeAdapterRequest(packet, 'dry_run');

  const validHttpProvider = createHttpRuntimeAdapterProvider({
    endpoint_url: 'http://local-worker.test/adapter',
    healthcheck_url: 'http://local-worker.test/health',
    timeout_ms: 1000,
    fetch_impl: async (url, init) => {
      if (String(url).endsWith('/health')) return new Response(JSON.stringify({ ok: true }), { status: 200 });
      const posted = JSON.parse(String(init?.body ?? '{}')) as RuntimeAdapterRequest;
      return new Response(JSON.stringify(responseFromRequest(posted)), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },
  });

  const invalidShapeProvider = createHttpRuntimeAdapterProvider({
    endpoint_url: 'http://local-worker.test/adapter',
    timeout_ms: 1000,
    fetch_impl: async () => new Response(JSON.stringify({ invalid: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }),
  });

  const health = await validHttpProvider.healthCheck?.();
  const response = await dispatchRuntimeAdapterRequest(validHttpProvider, request);
  const built = buildReviewAndMemory(packet, 'http', request, response);

  let invalidShapeRejected = false;
  let invalidShapeCode = '';
  try {
    await dispatchRuntimeAdapterRequest(invalidShapeProvider, request);
  } catch (error) {
    invalidShapeRejected = error instanceof RuntimeAdapterProviderError;
    invalidShapeCode = error instanceof RuntimeAdapterProviderError ? error.code : 'UNKNOWN';
  }

  const healthSummary = health ? {
    ok: health.ok,
    provider_id: health.provider_id,
    status: health.status,
    message: health.message,
  } : undefined;

  const assertions = [
    pass('http health boundary checked', health?.ok === true && health.provider_id === 'http', { health: healthSummary }),
    pass('http response shape guard checked', invalidShapeRejected && invalidShapeCode === 'INVALID_RUNTIME_ADAPTER_RESPONSE', { invalidShapeCode }),
    pass('runtime job created from valid http response', built.job.job_id.length > 0 && built.job.provider_id === 'http'),
    pass('memory context created', built.memoryContext.memory_update_packet.accepted_decisions.length > 0 && built.memoryContext.context_update_packet.next_run_context.required_followups.length > 0),
    pass('artifact summaries retained', built.memoryContext.memory_update_packet.artifact_summaries.length > 0),
  ];

  return {
    trial_id: config.scenario_id,
    provider: 'http',
    status: assertions.every((item) => item.pass) ? 'pass' : 'fail',
    assertions,
    runtime_job_summary: {
      job_id: built.job.job_id,
      status: built.job.status,
      event_count: built.job.events.length,
      artifact_count: built.job.artifacts.length,
      callback_count: built.job.callbacks.received,
    },
    review_summary: built.report.counts,
    memory_summary: {
      accepted_decisions: built.memoryContext.memory_update_packet.accepted_decisions.length,
      runtime_blockers: built.memoryContext.memory_update_packet.runtime_blockers.length,
      artifact_summaries: built.memoryContext.memory_update_packet.artifact_summaries.length,
      open_questions: built.memoryContext.memory_update_packet.open_questions.length,
    },
  };
}

const summaries = [await runMockAdapterTrial(), await runHttpAdapterDryRunTrial()];
const combined = {
  trial_suite: 'adapter-trials',
  generated_at: generatedAt,
  status: summaries.every((summary) => summary.status === 'pass') ? 'pass' : 'fail',
  summaries,
};

ensureDir('samples/adapter-trial-results');
for (const summary of summaries) {
  writeJson(`samples/adapter-trial-results/${summary.trial_id}.summary.json`, summary);
}
writeJson('samples/adapter-trial-results/adapter-trials-summary.json', combined);

console.log(JSON.stringify(combined, null, 2));

if (combined.status !== 'pass') {
  console.error('One or more adapter trials failed.');
  process.exit(1);
}
