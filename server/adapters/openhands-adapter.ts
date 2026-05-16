import type { RuntimeAdapterRequest, RuntimeAdapterResponse, RuntimeBridgeEvent, WorkOrderStep } from '../../src/runtimeAdapter.ts';

export type OpenHandsAdapterOptions = {
  target_worker?: string;
  now?: string;
};

export type OpenHandsArtifactExpectation = {
  step_id: string;
  kind: string;
  path_hint: string;
  summary: string;
};

export type OpenHandsWorkRequest = {
  packet_type: 'nexus.openhands.work_request';
  version: '0.1';
  request_id: string;
  target_worker: string;
  workspace: {
    mode: 'adapter_envelope_only';
    secret_policy: 'do_not_send_secrets';
  };
  objective: string;
  instructions: string[];
  expected_artifacts: OpenHandsArtifactExpectation[];
  safety: {
    arbitrary_command_execution: false;
    adapter_invokes_openhands: false;
    requires_operator_runtime: true;
  };
};

export type OpenHandsResult = {
  status: 'completed' | 'blocked';
  artifacts: OpenHandsArtifactExpectation[];
  notes: string[];
};

function stableSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'item';
}

function nowIso() {
  return new Date().toISOString();
}

function instructionFor(step: WorkOrderStep) {
  return `${step.title}: ${(step.expected_outputs ?? []).join(', ') || 'produce expected outputs'}`;
}

function expectedArtifactsFor(step: WorkOrderStep): OpenHandsArtifactExpectation[] {
  const outputs = step.expected_outputs?.length ? step.expected_outputs : ['openhands_summary'];
  return outputs.map((kind) => ({
    step_id: step.id,
    kind,
    path_hint: `${stableSlug(step.id)}-${stableSlug(kind)}.md`,
    summary: `Expected ${kind} for ${step.title}.`,
  }));
}

export function buildOpenHandsWorkRequest(request: RuntimeAdapterRequest, options: OpenHandsAdapterOptions = {}): OpenHandsWorkRequest {
  const packet = request.handoff_packet.task_packet;
  return {
    packet_type: 'nexus.openhands.work_request',
    version: '0.1',
    request_id: request.request_id,
    target_worker: options.target_worker ?? 'openhands-adapter',
    workspace: {
      mode: 'adapter_envelope_only',
      secret_policy: 'do_not_send_secrets',
    },
    objective: packet.objective,
    instructions: packet.work_order.map(instructionFor),
    expected_artifacts: packet.work_order.flatMap(expectedArtifactsFor),
    safety: {
      arbitrary_command_execution: false,
      adapter_invokes_openhands: false,
      requires_operator_runtime: true,
    },
  };
}

export function isOpenHandsWorkRequest(value: unknown): value is OpenHandsWorkRequest {
  const candidate = value as OpenHandsWorkRequest;
  return Boolean(
    candidate &&
    candidate.packet_type === 'nexus.openhands.work_request' &&
    candidate.version === '0.1' &&
    typeof candidate.request_id === 'string' &&
    candidate.workspace?.secret_policy === 'do_not_send_secrets' &&
    candidate.safety?.arbitrary_command_execution === false &&
    candidate.safety?.adapter_invokes_openhands === false &&
    Array.isArray(candidate.instructions) &&
    Array.isArray(candidate.expected_artifacts)
  );
}

function refsFor(result: OpenHandsResult, step: WorkOrderStep) {
  return result.artifacts
    .filter((artifact) => artifact.step_id === step.id)
    .map((artifact) => ({
      kind: artifact.kind,
      ref: `openhands:${artifact.path_hint}`,
      summary: artifact.summary,
    }));
}

function eventId(request: RuntimeAdapterRequest, step: WorkOrderStep, kind: string, index: number) {
  return `${stableSlug(request.request_id)}:${step.id}:openhands:${kind}:${index}`;
}

export function normalizeOpenHandsResult(
  request: RuntimeAdapterRequest,
  workRequest: OpenHandsWorkRequest,
  result: OpenHandsResult,
  options: OpenHandsAdapterOptions = {},
): RuntimeAdapterResponse {
  const packet = request.handoff_packet.task_packet;
  const timestamp = options.now ?? nowIso();
  const events: RuntimeBridgeEvent[] = [];
  let index = 0;

  for (const step of packet.work_order) {
    const artifactRefs = refsFor(result, step);
    events.push({
      event_id: eventId(request, step, 'artifact', index++),
      event_type: 'artifact_created',
      version: '0.1',
      task_packet_id: `${stableSlug(packet.objective)}.openhands`,
      step_id: step.id,
      status: result.status === 'completed' ? 'done' : 'blocked',
      timestamp,
      owner: step.owner,
      artifact_refs: artifactRefs,
      runtime_notes: 'OpenHands adapter normalized artifact expectations.',
    });
    events.push({
      event_id: eventId(request, step, 'finish', index++),
      event_type: result.status === 'completed' ? 'step_completed' : 'step_blocked',
      version: '0.1',
      task_packet_id: `${stableSlug(packet.objective)}.openhands`,
      step_id: step.id,
      status: result.status === 'completed' ? 'done' : 'blocked',
      timestamp,
      owner: step.owner,
      artifact_refs: artifactRefs,
      blocker_reason: result.status === 'blocked' ? 'OpenHands result was blocked.' : undefined,
      runtime_notes: result.notes.join(' '),
    });
  }

  return {
    packet_type: 'nexus.runtime_adapter_response',
    version: '0.1',
    request_id: request.request_id,
    accepted: true,
    status: result.status === 'completed' ? 'accepted' : 'failed',
    job: {
      job_id: `openhands-job-${stableSlug(request.request_id)}`,
      target_worker: workRequest.target_worker,
      started_at: timestamp,
    },
    events,
  };
}

export function createOpenHandsAdapterDryRun(request: RuntimeAdapterRequest, options: OpenHandsAdapterOptions = {}) {
  const workRequest = buildOpenHandsWorkRequest(request, options);
  const result: OpenHandsResult = {
    status: 'completed',
    artifacts: workRequest.expected_artifacts,
    notes: ['Dry-run envelope only.', 'No OpenHands runtime was invoked.'],
  };
  return {
    work_request: workRequest,
    runtime_response: normalizeOpenHandsResult(request, workRequest, result, options),
  };
}
