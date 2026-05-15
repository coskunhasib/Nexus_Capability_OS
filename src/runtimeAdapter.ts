export type WorkStatus = 'not_started' | 'in_progress' | 'blocked' | 'done';
export type GateStatus = 'not_checked' | 'pass' | 'fail';

export type GateEvidence = {
  status: GateStatus;
  evidence_note: string;
  blocker_reason: string;
};

export type EvidenceState = Record<string, Record<string, GateEvidence>>;

export type WorkOrderStep = {
  order?: number;
  id: string;
  title: string;
  owner: string;
  description?: string;
  expected_outputs?: string[];
  required_gates?: string[];
  related?: string;
  status?: WorkStatus;
};

export type TaskPacket = {
  packet_type: string;
  version: string;
  objective: string;
  source_compiler_rule?: string;
  routing?: {
    macro_pipeline?: string;
    micro_pipelines?: string[];
    capability_packs?: string[];
    skills?: string[];
  };
  skills?: Array<{ skill: string; required?: boolean }>;
  team?: Array<{ profile: string; role?: boolean | string }>;
  gates?: Array<{ gate: string; required?: boolean }>;
  policies?: {
    memory?: string;
    context?: string;
  };
  work_order: WorkOrderStep[];
};

export type NexusHandoffPacket = {
  packet_type: 'nexus.handoff_packet';
  version: '0.1';
  objective: string;
  capability_os: {
    compiler_rule: string;
    macro_pipeline: string;
    memory_policy: string;
    context_policy: string;
  };
  selected_capability: {
    pack_id: string;
    profiles: string[];
    skills: string[];
    micro_pipelines: string[];
    gates: string[];
  };
  task_packet: TaskPacket;
  runtime_requirements: {
    target_runtime: string;
    required_tools: string[];
    required_skills: string[];
    artifact_outputs: string[];
  };
  callback_contract: {
    expected_events: RuntimeBridgeEventType[];
    required_payloads: string[];
  };
};

export type RuntimeAdapterRequest = {
  packet_type: 'nexus.runtime_adapter_request';
  version: '0.1';
  request_id: string;
  handoff_packet: NexusHandoffPacket;
  dispatch: {
    mode: 'dry_run' | 'mock' | 'real';
    target_worker: string;
    priority: 'low' | 'normal' | 'high';
    idempotency_key: string;
    callback_url: string;
    timeout_seconds: number;
  };
  operator_notes?: string;
};

export type RuntimeBridgeEventType = 'step_started' | 'step_completed' | 'step_blocked' | 'gate_checked' | 'artifact_created' | 'runtime_failed';

export type RuntimeBridgeEvent = {
  event_id?: string;
  event_type: RuntimeBridgeEventType;
  version: '0.1';
  task_packet_id: string;
  step_id: string;
  status: WorkStatus;
  timestamp: string;
  owner?: string;
  gate_evidence?: Array<{
    gate: string;
    status: GateStatus;
    evidence_note: string;
    blocker_reason: string;
  }>;
  artifact_refs?: Array<{
    kind: string;
    ref: string;
    summary: string;
  }>;
  blocker_reason?: string;
  runtime_notes?: string;
};

export type RuntimeAdapterResponse = {
  packet_type: 'nexus.runtime_adapter_response';
  version: '0.1';
  request_id: string;
  accepted: boolean;
  status: 'accepted' | 'rejected' | 'queued' | 'running' | 'failed';
  job: {
    job_id: string;
    target_worker: string;
    started_at: string;
    estimated_next_callback?: string;
  };
  events: RuntimeBridgeEvent[];
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
};

export type RuntimeCallbackPayload = {
  packet_type: 'nexus.runtime_callback';
  version: '0.1';
  request_id: string;
  job_id: string;
  provider_id?: string;
  received_at: string;
  events: RuntimeBridgeEvent[];
};

export type RuntimeCallbackValidation = {
  valid: boolean;
  errors: string[];
  payload?: RuntimeCallbackPayload;
};

export type RuntimeCallbackIngestResult = RunnerStatePatch & {
  callback: RuntimeCallbackPayload;
  accepted_events: RuntimeBridgeEvent[];
  duplicate_events: RuntimeBridgeEvent[];
  seen_event_keys: string[];
};

export type RunnerStatePatch = {
  statuses: Record<string, WorkStatus>;
  evidence: EvidenceState;
  applied_events: RuntimeBridgeEvent[];
};

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[]));
}

function nowIso() {
  return new Date().toISOString();
}

function stableSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 48) || 'task';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function isWorkStatus(value: unknown): value is WorkStatus {
  return value === 'not_started' || value === 'in_progress' || value === 'blocked' || value === 'done';
}

function isGateStatus(value: unknown): value is GateStatus {
  return value === 'not_checked' || value === 'pass' || value === 'fail';
}

function isRuntimeBridgeEventType(value: unknown): value is RuntimeBridgeEventType {
  return value === 'step_started' || value === 'step_completed' || value === 'step_blocked' || value === 'gate_checked' || value === 'artifact_created' || value === 'runtime_failed';
}

export function runtimeEventKey(event: RuntimeBridgeEvent) {
  return event.event_id ?? `${event.event_type}:${event.task_packet_id}:${event.step_id}:${event.status}:${event.timestamp}`;
}

export function isRuntimeBridgeEvent(value: unknown): value is RuntimeBridgeEvent {
  if (!isRecord(value)) return false;
  if (value.event_id !== undefined && typeof value.event_id !== 'string') return false;
  if (!isRuntimeBridgeEventType(value.event_type)) return false;
  if (value.version !== '0.1') return false;
  if (typeof value.task_packet_id !== 'string') return false;
  if (typeof value.step_id !== 'string') return false;
  if (!isWorkStatus(value.status)) return false;
  if (typeof value.timestamp !== 'string') return false;
  if (value.owner !== undefined && typeof value.owner !== 'string') return false;
  if (value.blocker_reason !== undefined && typeof value.blocker_reason !== 'string') return false;
  if (value.runtime_notes !== undefined && typeof value.runtime_notes !== 'string') return false;
  if (value.gate_evidence !== undefined) {
    if (!Array.isArray(value.gate_evidence)) return false;
    for (const item of value.gate_evidence) {
      if (!isRecord(item)) return false;
      if (typeof item.gate !== 'string') return false;
      if (!isGateStatus(item.status)) return false;
      if (typeof item.evidence_note !== 'string') return false;
      if (typeof item.blocker_reason !== 'string') return false;
    }
  }
  if (value.artifact_refs !== undefined) {
    if (!Array.isArray(value.artifact_refs)) return false;
    for (const item of value.artifact_refs) {
      if (!isRecord(item)) return false;
      if (typeof item.kind !== 'string') return false;
      if (typeof item.ref !== 'string') return false;
      if (typeof item.summary !== 'string') return false;
    }
  }
  return true;
}

export function validateRuntimeCallbackPayload(value: unknown): RuntimeCallbackValidation {
  const errors: string[] = [];
  if (!isRecord(value)) return { valid: false, errors: ['callback payload must be an object'] };
  if (value.packet_type !== 'nexus.runtime_callback') errors.push('packet_type must be nexus.runtime_callback');
  if (value.version !== '0.1') errors.push('version must be 0.1');
  if (typeof value.request_id !== 'string') errors.push('request_id must be a string');
  if (typeof value.job_id !== 'string') errors.push('job_id must be a string');
  if (value.provider_id !== undefined && typeof value.provider_id !== 'string') errors.push('provider_id must be a string when present');
  if (typeof value.received_at !== 'string') errors.push('received_at must be a string');
  if (!Array.isArray(value.events)) {
    errors.push('events must be an array');
  } else {
    value.events.forEach((event, index) => {
      if (!isRuntimeBridgeEvent(event)) errors.push(`events[${index}] must be a runtime bridge event`);
    });
  }
  if (errors.length) return { valid: false, errors };
  return { valid: true, errors: [], payload: value as RuntimeCallbackPayload };
}

export function buildNexusHandoffFromTaskPacket(packet: TaskPacket): NexusHandoffPacket {
  const skills = unique([...(packet.routing?.skills ?? []), ...(packet.skills ?? []).map((item) => item.skill)]);
  const gates = unique([...(packet.gates ?? []).map((item) => item.gate), ...packet.work_order.flatMap((step) => step.required_gates ?? [])]);
  const profiles = unique(packet.team?.map((item) => item.profile) ?? []);
  const artifactOutputs = unique([
    ...packet.work_order.flatMap((step) => step.expected_outputs ?? []),
    'review_report',
    'memory_update_packet',
    'context_update_packet',
  ]);

  return {
    packet_type: 'nexus.handoff_packet',
    version: '0.1',
    objective: packet.objective,
    capability_os: {
      compiler_rule: packet.source_compiler_rule ?? 'manual-runner-packet',
      macro_pipeline: packet.routing?.macro_pipeline ?? 'unspecified',
      memory_policy: packet.policies?.memory ?? 'unspecified',
      context_policy: packet.policies?.context ?? 'unspecified',
    },
    selected_capability: {
      pack_id: packet.routing?.capability_packs?.[0] ?? 'manual-runner-pack',
      profiles,
      skills,
      micro_pipelines: packet.routing?.micro_pipelines ?? [],
      gates,
    },
    task_packet: packet,
    runtime_requirements: {
      target_runtime: 'nexus-worker/mock-adapter',
      required_tools: unique(['runtime-bridge', 'artifact-reporter', 'gate-evidence-reporter', 'review-reporter', 'memory-writer']),
      required_skills: skills,
      artifact_outputs: artifactOutputs,
    },
    callback_contract: {
      expected_events: ['step_started', 'gate_checked', 'artifact_created', 'step_completed', 'step_blocked', 'runtime_failed'],
      required_payloads: ['step_status', 'gate_evidence', 'artifact_refs', 'blocker_reason', 'missing_evidence'],
    },
  };
}

export function buildRuntimeAdapterRequest(packet: TaskPacket, mode: 'dry_run' | 'mock' | 'real' = 'mock'): RuntimeAdapterRequest {
  const handoff = buildNexusHandoffFromTaskPacket(packet);
  const slug = stableSlug(packet.objective);
  return {
    packet_type: 'nexus.runtime_adapter_request',
    version: '0.1',
    request_id: `runtime-adapter-request-${slug}`,
    handoff_packet: handoff,
    dispatch: {
      mode,
      target_worker: 'nexus-worker/mock-adapter',
      priority: 'normal',
      idempotency_key: `${slug}-001`,
      callback_url: 'capability-os://runtime/callbacks',
      timeout_seconds: 900,
    },
    operator_notes: 'Generated by Task Runner adapter simulation.',
  };
}

function gateEvidenceFor(step: WorkOrderStep): RuntimeBridgeEvent['gate_evidence'] {
  return (step.required_gates ?? []).map((gate) => ({
    gate,
    status: 'pass',
    evidence_note: `Mock adapter checked ${gate} for ${step.title}.`,
    blocker_reason: '',
  }));
}

function artifactRefsFor(packet: TaskPacket, step: WorkOrderStep): NonNullable<RuntimeBridgeEvent['artifact_refs']> {
  const outputs = step.expected_outputs?.length ? step.expected_outputs : ['runtime_note'];
  const slug = stableSlug(packet.objective);
  return outputs.slice(0, 4).map((kind) => ({
    kind,
    ref: `artifact://${slug}/${step.id}/${kind}`,
    summary: `${kind} produced by mock runtime adapter for ${step.title}.`,
  }));
}

function eventIdFor(packet: TaskPacket, step: WorkOrderStep, eventType: RuntimeBridgeEventType, sequence: number) {
  return `${stableSlug(packet.objective)}:${step.id}:${eventType}:${sequence}`;
}

export function runMockRuntimeAdapter(request: RuntimeAdapterRequest): RuntimeAdapterResponse {
  const packet = request.handoff_packet.task_packet;
  const firstStep = packet.work_order[0];
  const secondStep = packet.work_order[1] ?? firstStep;
  const startedAt = nowIso();
  const taskId = `${stableSlug(packet.objective)}.adapter-run`;
  const events: RuntimeBridgeEvent[] = [];

  if (!firstStep) {
    return {
      packet_type: 'nexus.runtime_adapter_response',
      version: '0.1',
      request_id: request.request_id,
      accepted: false,
      status: 'rejected',
      job: {
        job_id: `job-${stableSlug(request.request_id)}`,
        target_worker: request.dispatch.target_worker,
        started_at: startedAt,
      },
      events,
      error: {
        code: 'EMPTY_WORK_ORDER',
        message: 'Task packet has no work_order steps.',
        retryable: false,
      },
    };
  }

  events.push({
    event_id: eventIdFor(packet, firstStep, 'step_started', 0),
    event_type: 'step_started',
    version: '0.1',
    task_packet_id: taskId,
    step_id: firstStep.id,
    status: 'in_progress',
    timestamp: startedAt,
    owner: firstStep.owner,
    runtime_notes: `Mock adapter accepted ${packet.objective} and started ${firstStep.title}.`,
  });

  events.push({
    event_id: eventIdFor(packet, firstStep, 'gate_checked', 1),
    event_type: 'gate_checked',
    version: '0.1',
    task_packet_id: taskId,
    step_id: firstStep.id,
    status: 'in_progress',
    timestamp: nowIso(),
    owner: firstStep.owner,
    gate_evidence: gateEvidenceFor(firstStep),
    runtime_notes: `Mock adapter reported gate evidence for ${firstStep.title}.`,
  });

  events.push({
    event_id: eventIdFor(packet, firstStep, 'artifact_created', 2),
    event_type: 'artifact_created',
    version: '0.1',
    task_packet_id: taskId,
    step_id: firstStep.id,
    status: 'done',
    timestamp: nowIso(),
    owner: firstStep.owner,
    artifact_refs: artifactRefsFor(packet, firstStep),
    runtime_notes: `Mock adapter created artifacts for ${firstStep.title}.`,
  });

  events.push({
    event_id: eventIdFor(packet, firstStep, 'step_completed', 3),
    event_type: 'step_completed',
    version: '0.1',
    task_packet_id: taskId,
    step_id: firstStep.id,
    status: 'done',
    timestamp: nowIso(),
    owner: firstStep.owner,
    artifact_refs: artifactRefsFor(packet, firstStep),
    runtime_notes: `Mock adapter completed ${firstStep.title}.`,
  });

  if (secondStep && secondStep.id !== firstStep.id) {
    events.push({
      event_id: eventIdFor(packet, secondStep, 'step_started', 4),
      event_type: 'step_started',
      version: '0.1',
      task_packet_id: taskId,
      step_id: secondStep.id,
      status: 'in_progress',
      timestamp: nowIso(),
      owner: secondStep.owner,
      runtime_notes: `Mock adapter started next step: ${secondStep.title}.`,
    });
  }

  return {
    packet_type: 'nexus.runtime_adapter_response',
    version: '0.1',
    request_id: request.request_id,
    accepted: true,
    status: 'accepted',
    job: {
      job_id: `job-${stableSlug(packet.objective)}`,
      target_worker: request.dispatch.target_worker,
      started_at: startedAt,
      estimated_next_callback: new Date(Date.now() + 5000).toISOString(),
    },
    events,
  };
}

export function applyRuntimeEventsToRunnerState(statuses: Record<string, WorkStatus>, evidence: EvidenceState, events: RuntimeBridgeEvent[]): RunnerStatePatch {
  const nextStatuses: Record<string, WorkStatus> = { ...statuses };
  const nextEvidence: EvidenceState = Object.fromEntries(
    Object.entries(evidence).map(([stepId, gateMap]) => [
      stepId,
      Object.fromEntries(Object.entries(gateMap).map(([gate, gateEvidence]) => [gate, { ...gateEvidence }])),
    ]),
  ) as EvidenceState;

  for (const event of events) {
    if (event.step_id) nextStatuses[event.step_id] = event.status;
    if (event.event_type === 'step_completed') nextStatuses[event.step_id] = 'done';
    if (event.event_type === 'step_blocked') nextStatuses[event.step_id] = 'blocked';
    if (event.event_type === 'gate_checked') {
      for (const item of event.gate_evidence ?? []) {
        nextEvidence[event.step_id] = {
          ...(nextEvidence[event.step_id] ?? {}),
          [item.gate]: {
            status: item.status,
            evidence_note: item.evidence_note,
            blocker_reason: item.blocker_reason,
          },
        };
      }
    }
  }

  return { statuses: nextStatuses, evidence: nextEvidence, applied_events: events };
}

export function ingestRuntimeCallback(
  statuses: Record<string, WorkStatus>,
  evidence: EvidenceState,
  payload: RuntimeCallbackPayload,
  seenEventKeys: string[] = [],
): RuntimeCallbackIngestResult {
  const seen = new Set(seenEventKeys);
  const acceptedEvents: RuntimeBridgeEvent[] = [];
  const duplicateEvents: RuntimeBridgeEvent[] = [];

  for (const event of payload.events) {
    const key = runtimeEventKey(event);
    if (seen.has(key)) {
      duplicateEvents.push(event);
      continue;
    }
    seen.add(key);
    acceptedEvents.push(event);
  }

  const patch = applyRuntimeEventsToRunnerState(statuses, evidence, acceptedEvents);
  return {
    ...patch,
    callback: payload,
    accepted_events: acceptedEvents,
    duplicate_events: duplicateEvents,
    seen_event_keys: Array.from(seen),
  };
}

export function buildMockRuntimeCallbackPayload(request: RuntimeAdapterRequest, response: RuntimeAdapterResponse, sequence: number): RuntimeCallbackPayload {
  const packet = request.handoff_packet.task_packet;
  const steps = packet.work_order.length ? packet.work_order : [];
  const step = steps[Math.min(Math.floor(sequence / 4), Math.max(steps.length - 1, 0))];
  const receivedAt = nowIso();
  const taskId = `${stableSlug(packet.objective)}.adapter-run`;
  const events: RuntimeBridgeEvent[] = [];

  if (step) {
    const phase = sequence % 4;
    const eventType: RuntimeBridgeEventType = phase === 0 ? 'step_started' : phase === 1 ? 'gate_checked' : phase === 2 ? 'artifact_created' : 'step_completed';
    const status: WorkStatus = eventType === 'step_started' || eventType === 'gate_checked' ? 'in_progress' : 'done';
    events.push({
      event_id: eventIdFor(packet, step, eventType, 100 + sequence),
      event_type: eventType,
      version: '0.1',
      task_packet_id: taskId,
      step_id: step.id,
      status,
      timestamp: receivedAt,
      owner: step.owner,
      gate_evidence: eventType === 'gate_checked' ? gateEvidenceFor(step) : undefined,
      artifact_refs: eventType === 'artifact_created' || eventType === 'step_completed' ? artifactRefsFor(packet, step) : undefined,
      runtime_notes: `Mock callback ${eventType} for ${step.title}.`,
    });
  }

  return {
    packet_type: 'nexus.runtime_callback',
    version: '0.1',
    request_id: request.request_id,
    job_id: response.job.job_id,
    provider_id: response.job.target_worker,
    received_at: receivedAt,
    events,
  };
}

export function summarizeRuntimeAdapterResponse(response: RuntimeAdapterResponse) {
  const eventTypes = Array.from(new Set(response.events.map((event) => event.event_type)));
  return {
    accepted: response.accepted,
    status: response.status,
    job_id: response.job.job_id,
    target_worker: response.job.target_worker,
    event_count: response.events.length,
    event_types: eventTypes,
  };
}
