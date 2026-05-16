import type { RuntimeAdapterRequest, RuntimeAdapterResponse, RuntimeBridgeEvent, WorkOrderStep } from '../../src/runtimeAdapter.ts';

export type CodeAgentKind = 'codex' | 'claude-code';

export type CodeAgentAdapterOptions = {
  agent_kind?: CodeAgentKind;
  target_worker?: string;
  now?: string;
};

export type CodeAgentArtifactExpectation = {
  step_id: string;
  kind: string;
  path_hint: string;
  summary: string;
};

export type CodeAgentWorkRequest = {
  packet_type: 'nexus.code_agent.work_request';
  version: '0.1';
  request_id: string;
  agent_kind: CodeAgentKind;
  target_worker: string;
  workspace: {
    mode: 'adapter_envelope_only';
    secret_policy: 'do_not_send_secrets';
  };
  objective: string;
  prompt_sections: string[];
  expected_artifacts: CodeAgentArtifactExpectation[];
  safety: {
    arbitrary_command_execution: false;
    adapter_invokes_agent: false;
    requires_operator_runtime: true;
  };
};

export type CodeAgentResult = {
  status: 'completed' | 'blocked';
  artifacts: CodeAgentArtifactExpectation[];
  notes: string[];
};

function stableSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'item';
}

function nowIso() {
  return new Date().toISOString();
}

function promptFor(step: WorkOrderStep) {
  return [
    `Step: ${step.title}`,
    `Owner: ${step.owner}`,
    step.description ? `Description: ${step.description}` : undefined,
    step.expected_outputs?.length ? `Expected outputs: ${step.expected_outputs.join(', ')}` : undefined,
    step.required_gates?.length ? `Required gates: ${step.required_gates.join(', ')}` : undefined,
  ].filter(Boolean).join('\n');
}

function expectedArtifactsFor(step: WorkOrderStep): CodeAgentArtifactExpectation[] {
  const outputs = step.expected_outputs?.length ? step.expected_outputs : ['code_agent_summary'];
  return outputs.map((kind) => ({
    step_id: step.id,
    kind,
    path_hint: `${stableSlug(step.id)}-${stableSlug(kind)}.md`,
    summary: `Expected ${kind} for ${step.title}.`,
  }));
}

export function buildCodeAgentWorkRequest(request: RuntimeAdapterRequest, options: CodeAgentAdapterOptions = {}): CodeAgentWorkRequest {
  const packet = request.handoff_packet.task_packet;
  const agentKind = options.agent_kind ?? 'codex';
  return {
    packet_type: 'nexus.code_agent.work_request',
    version: '0.1',
    request_id: request.request_id,
    agent_kind: agentKind,
    target_worker: options.target_worker ?? `${agentKind}-adapter`,
    workspace: {
      mode: 'adapter_envelope_only',
      secret_policy: 'do_not_send_secrets',
    },
    objective: packet.objective,
    prompt_sections: packet.work_order.map(promptFor),
    expected_artifacts: packet.work_order.flatMap(expectedArtifactsFor),
    safety: {
      arbitrary_command_execution: false,
      adapter_invokes_agent: false,
      requires_operator_runtime: true,
    },
  };
}

export function isCodeAgentWorkRequest(value: unknown): value is CodeAgentWorkRequest {
  const candidate = value as CodeAgentWorkRequest;
  return Boolean(
    candidate &&
    candidate.packet_type === 'nexus.code_agent.work_request' &&
    candidate.version === '0.1' &&
    typeof candidate.request_id === 'string' &&
    (candidate.agent_kind === 'codex' || candidate.agent_kind === 'claude-code') &&
    candidate.workspace?.secret_policy === 'do_not_send_secrets' &&
    candidate.safety?.arbitrary_command_execution === false &&
    candidate.safety?.adapter_invokes_agent === false &&
    Array.isArray(candidate.prompt_sections) &&
    Array.isArray(candidate.expected_artifacts)
  );
}

function refsFor(result: CodeAgentResult, step: WorkOrderStep) {
  return result.artifacts
    .filter((artifact) => artifact.step_id === step.id)
    .map((artifact) => ({
      kind: artifact.kind,
      ref: `code-agent:${artifact.path_hint}`,
      summary: artifact.summary,
    }));
}

function eventId(request: RuntimeAdapterRequest, step: WorkOrderStep, kind: string, index: number) {
  return `${stableSlug(request.request_id)}:${step.id}:code-agent:${kind}:${index}`;
}

export function normalizeCodeAgentResult(
  request: RuntimeAdapterRequest,
  workRequest: CodeAgentWorkRequest,
  result: CodeAgentResult,
  options: CodeAgentAdapterOptions = {},
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
      task_packet_id: `${stableSlug(packet.objective)}.code-agent`,
      step_id: step.id,
      status: result.status === 'completed' ? 'done' : 'blocked',
      timestamp,
      owner: step.owner,
      artifact_refs: artifactRefs,
      runtime_notes: `${workRequest.agent_kind} adapter normalized artifact expectations.`,
    });
    events.push({
      event_id: eventId(request, step, 'finish', index++),
      event_type: result.status === 'completed' ? 'step_completed' : 'step_blocked',
      version: '0.1',
      task_packet_id: `${stableSlug(packet.objective)}.code-agent`,
      step_id: step.id,
      status: result.status === 'completed' ? 'done' : 'blocked',
      timestamp,
      owner: step.owner,
      artifact_refs: artifactRefs,
      blocker_reason: result.status === 'blocked' ? 'Code agent result was blocked.' : undefined,
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
      job_id: `code-agent-job-${stableSlug(request.request_id)}`,
      target_worker: workRequest.target_worker,
      started_at: timestamp,
    },
    events,
  };
}

export function createCodeAgentAdapterDryRun(request: RuntimeAdapterRequest, options: CodeAgentAdapterOptions = {}) {
  const workRequest = buildCodeAgentWorkRequest(request, options);
  const result: CodeAgentResult = {
    status: 'completed',
    artifacts: workRequest.expected_artifacts,
    notes: ['Dry-run envelope only.', 'No code agent runtime was invoked.'],
  };
  return {
    work_request: workRequest,
    runtime_response: normalizeCodeAgentResult(request, workRequest, result, options),
  };
}
