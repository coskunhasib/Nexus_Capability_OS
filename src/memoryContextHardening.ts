import type { RuntimeJobState, TaskPacket } from './runtimeAdapter.ts';
import type { RuntimeArtifactRegistry } from './runtimeArtifactRegistry.ts';
import type {
  ArtifactBackedEvidence,
  HardenedReviewReport,
  ReviewBlocker,
  ReviewEvidenceItem,
} from './reviewReportHardening.ts';

export type MemoryDecision = {
  decision_id: string;
  summary: string;
  source: 'human_evidence' | 'runtime_evidence' | 'artifact_evidence';
  step_id: string;
  step_title: string;
  gate?: string;
  artifact_id?: string;
  confidence: 'high' | 'medium' | 'low';
};

export type RuntimeBlockerMemory = {
  blocker_id: string;
  type: ReviewBlocker['type'];
  step_id: string;
  step_title: string;
  gate?: string;
  message: string;
  source: 'hardened_review_report';
};

export type ArtifactSummary = {
  artifact_id: string;
  step_id: string;
  kind: string;
  ref: string;
  summary: string;
  store_policy: 'summary_and_ref_only';
};

export type OpenQuestion = {
  question_id: string;
  step_id: string;
  step_title: string;
  gate?: string;
  question: string;
  reason: ReviewBlocker['type'];
};

export type ProviderJobMetadata = {
  job_id?: string;
  request_id?: string;
  provider_id?: string;
  target_worker?: string;
  status?: string;
  started_at?: string;
  last_event_at?: string;
  event_count: number;
  artifact_count: number;
  error_count: number;
  callback_count: number;
};

export type DoNotStorePolicy = {
  rule_id: 'memory-context-hardening-do-not-store';
  rationale: string;
  excluded_fields: string[];
  rules: string[];
};

export type NextRunContext = {
  objective: string;
  recommended_start_step?: string;
  routing: {
    macro_pipeline?: string;
    micro_pipelines: string[];
    capability_packs: string[];
    skills: string[];
  };
  policies: {
    memory?: string;
    context?: string;
  };
  carry_forward_decisions: string[];
  carry_forward_artifacts: ArtifactSummary[];
  required_followups: string[];
  max_context_items: number;
};

export type HardenedMemoryUpdatePacket = {
  packet_type: 'nexus.memory_update_packet';
  version: '0.2';
  objective: string;
  release_ready: boolean;
  accepted_decisions: MemoryDecision[];
  runtime_blockers: RuntimeBlockerMemory[];
  artifact_summaries: ArtifactSummary[];
  open_questions: OpenQuestion[];
  provider_job_metadata: ProviderJobMetadata;
  do_not_store: DoNotStorePolicy;
  source_counts: HardenedReviewReport['counts'];
  generated_at: string;
};

export type HardenedContextUpdatePacket = {
  packet_type: 'nexus.context_update_packet';
  version: '0.2';
  objective: string;
  next_run_context: NextRunContext;
  unresolved_blockers: RuntimeBlockerMemory[];
  open_questions: OpenQuestion[];
  provider_job_metadata: ProviderJobMetadata;
  do_not_store: DoNotStorePolicy;
  generated_at: string;
};

export type MemoryContextHardeningOptions = {
  job?: RuntimeJobState;
  artifactRegistry?: RuntimeArtifactRegistry;
  generatedAt?: string;
  maxContextItems?: number;
};

export type MemoryContextHardeningResult = {
  memory_update_packet: HardenedMemoryUpdatePacket;
  context_update_packet: HardenedContextUpdatePacket;
};

function stableSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 72) || 'item';
}

function compactText(input: string, max = 220) {
  const compact = input.replace(/\s+/g, ' ').trim();
  return compact.length > max ? `${compact.slice(0, max - 1)}…` : compact;
}

function uniqueBy<T>(items: T[], keyFn: (item: T) => string) {
  const seen = new Set<string>();
  const output: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function decisionFromEvidence(item: ReviewEvidenceItem, source: MemoryDecision['source']): MemoryDecision | undefined {
  if (item.status !== 'pass' || !item.evidence_note.trim()) return undefined;
  return {
    decision_id: `${source}:${stableSlug(item.step_id)}:${stableSlug(item.gate)}`,
    summary: compactText(`${item.step_title} passed ${item.gate}: ${item.evidence_note}`),
    source,
    step_id: item.step_id,
    step_title: item.step_title,
    gate: item.gate,
    confidence: source === 'runtime_evidence' ? 'high' : 'medium',
  };
}

function decisionFromArtifact(item: ArtifactBackedEvidence): MemoryDecision {
  return {
    decision_id: `artifact_evidence:${stableSlug(item.artifact_id)}`,
    summary: compactText(`${item.kind} artifact is available for ${item.step_title}: ${item.summary}`),
    source: 'artifact_evidence',
    step_id: item.step_id,
    step_title: item.step_title,
    artifact_id: item.artifact_id,
    confidence: 'medium',
  };
}

function buildAcceptedDecisions(report: HardenedReviewReport) {
  const decisions = [
    ...report.human_entered_evidence.map((item) => decisionFromEvidence(item, 'human_evidence')),
    ...report.runtime_reported_evidence.map((item) => decisionFromEvidence(item, 'runtime_evidence')),
    ...report.artifact_backed_evidence.map(decisionFromArtifact),
  ].filter(Boolean) as MemoryDecision[];

  return uniqueBy(decisions, (item) => item.decision_id);
}

function buildRuntimeBlockers(report: HardenedReviewReport): RuntimeBlockerMemory[] {
  return uniqueBy(
    report.release_blockers.map((item) => ({
      blocker_id: `${item.type}:${stableSlug(item.step_id)}:${stableSlug(item.gate ?? item.message)}`,
      type: item.type,
      step_id: item.step_id,
      step_title: item.step_title,
      gate: item.gate,
      message: compactText(item.message),
      source: 'hardened_review_report' as const,
    })),
    (item) => item.blocker_id,
  );
}

function artifactsFromReport(report: HardenedReviewReport): ArtifactSummary[] {
  return uniqueBy(
    report.artifact_backed_evidence.map((item) => ({
      artifact_id: item.artifact_id,
      step_id: item.step_id,
      kind: item.kind,
      ref: item.ref,
      summary: compactText(item.summary),
      store_policy: 'summary_and_ref_only' as const,
    })),
    (item) => item.artifact_id,
  );
}

function artifactsFromRegistry(registry?: RuntimeArtifactRegistry): ArtifactSummary[] {
  return uniqueBy(
    (registry?.artifacts ?? []).map((item) => ({
      artifact_id: item.artifact_id,
      step_id: item.step_id,
      kind: item.kind,
      ref: item.ref,
      summary: compactText(item.summary),
      store_policy: 'summary_and_ref_only' as const,
    })),
    (item) => item.artifact_id,
  );
}

function buildArtifactSummaries(report: HardenedReviewReport, registry?: RuntimeArtifactRegistry) {
  const registryArtifacts = artifactsFromRegistry(registry);
  return registryArtifacts.length ? registryArtifacts : artifactsFromReport(report);
}

function blockerQuestion(item: ReviewBlocker) {
  if (item.type === 'missing_evidence') return `What evidence is required to close ${item.gate ?? item.step_title}?`;
  if (item.type === 'failed_gate') return `What change or decision is needed to pass ${item.gate ?? item.step_title}?`;
  if (item.type === 'blocked_step') return `What dependency is blocking ${item.step_title}?`;
  return `What work remains before ${item.step_title} can be marked done?`;
}

function buildOpenQuestions(report: HardenedReviewReport): OpenQuestion[] {
  return uniqueBy(
    report.release_blockers.map((item) => ({
      question_id: `${item.type}:${stableSlug(item.step_id)}:${stableSlug(item.gate ?? 'step')}`,
      step_id: item.step_id,
      step_title: item.step_title,
      gate: item.gate,
      question: blockerQuestion(item),
      reason: item.type,
    })),
    (item) => item.question_id,
  );
}

function buildProviderMetadata(job?: RuntimeJobState): ProviderJobMetadata {
  return {
    job_id: job?.job_id,
    request_id: job?.request_id,
    provider_id: job?.provider_id,
    target_worker: job?.target_worker,
    status: job?.status,
    started_at: job?.started_at,
    last_event_at: job?.last_event_at,
    event_count: job?.events.length ?? 0,
    artifact_count: job?.artifacts.length ?? 0,
    error_count: job?.errors.length ?? 0,
    callback_count: job?.callbacks.received ?? 0,
  };
}

function buildDoNotStorePolicy(): DoNotStorePolicy {
  return {
    rule_id: 'memory-context-hardening-do-not-store',
    rationale: 'Store durable decisions, summaries, references and unresolved questions; do not store raw runtime payloads or sensitive transient data.',
    excluded_fields: [
      'raw_runtime_events',
      'raw_callback_payloads',
      'raw_artifact_payloads',
      'secrets_or_credentials',
      'personal_data_not_required_for_next_run',
      'full_conversation_transcripts',
    ],
    rules: [
      'Persist artifact summaries and artifact refs only, not raw artifact contents.',
      'Persist blocker summaries and follow-up questions, not full runtime logs.',
      'Persist provider/job identifiers only when they are needed for traceability.',
      'Drop credentials, tokens, private personal data and irrelevant conversation context.',
    ],
  };
}

function routingFromPacket(packet: TaskPacket): NextRunContext['routing'] {
  return {
    macro_pipeline: packet.routing?.macro_pipeline,
    micro_pipelines: packet.routing?.micro_pipelines ?? [],
    capability_packs: packet.routing?.capability_packs ?? [],
    skills: [
      ...(packet.routing?.skills ?? []),
      ...(packet.skills ?? []).map((item) => item.skill),
    ].filter((value, index, values) => values.indexOf(value) === index),
  };
}

function buildNextRunContext(
  packet: TaskPacket,
  decisions: MemoryDecision[],
  artifacts: ArtifactSummary[],
  blockers: RuntimeBlockerMemory[],
  questions: OpenQuestion[],
  maxContextItems: number,
): NextRunContext {
  const firstBlocker = blockers[0];
  return {
    objective: packet.objective,
    recommended_start_step: firstBlocker?.step_id,
    routing: routingFromPacket(packet),
    policies: {
      memory: packet.policies?.memory,
      context: packet.policies?.context,
    },
    carry_forward_decisions: decisions.slice(0, maxContextItems).map((item) => item.summary),
    carry_forward_artifacts: artifacts.slice(0, maxContextItems),
    required_followups: [
      ...blockers.map((item) => `${item.step_title}: ${item.message}`),
      ...questions.map((item) => item.question),
    ].slice(0, maxContextItems),
    max_context_items: maxContextItems,
  };
}

export function buildHardenedMemoryContextPackets(
  packet: TaskPacket,
  report: HardenedReviewReport,
  options: MemoryContextHardeningOptions = {},
): MemoryContextHardeningResult {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const maxContextItems = options.maxContextItems ?? 12;
  const acceptedDecisions = buildAcceptedDecisions(report);
  const runtimeBlockers = buildRuntimeBlockers(report);
  const artifactSummaries = buildArtifactSummaries(report, options.artifactRegistry);
  const openQuestions = buildOpenQuestions(report);
  const providerJobMetadata = buildProviderMetadata(options.job);
  const doNotStore = buildDoNotStorePolicy();
  const nextRunContext = buildNextRunContext(packet, acceptedDecisions, artifactSummaries, runtimeBlockers, openQuestions, maxContextItems);

  return {
    memory_update_packet: {
      packet_type: 'nexus.memory_update_packet',
      version: '0.2',
      objective: packet.objective,
      release_ready: report.release_ready,
      accepted_decisions: acceptedDecisions,
      runtime_blockers: runtimeBlockers,
      artifact_summaries: artifactSummaries,
      open_questions: openQuestions,
      provider_job_metadata: providerJobMetadata,
      do_not_store: doNotStore,
      source_counts: report.counts,
      generated_at: generatedAt,
    },
    context_update_packet: {
      packet_type: 'nexus.context_update_packet',
      version: '0.2',
      objective: packet.objective,
      next_run_context: nextRunContext,
      unresolved_blockers: runtimeBlockers,
      open_questions: openQuestions,
      provider_job_metadata: providerJobMetadata,
      do_not_store: doNotStore,
      generated_at: generatedAt,
    },
  };
}
