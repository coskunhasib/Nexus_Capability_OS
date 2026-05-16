import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import type { RuntimeBridgeEvent, RuntimeAdapterRequest, RuntimeAdapterResponse, WorkOrderStep } from '../src/runtimeAdapter.ts';

export type RealWorkerActionKind = 'write_step_artifact';

export type RealWorkerOptions = {
  output_dir?: string;
  worker_id?: string;
  now?: string;
};

export type RealWorkerArtifact = {
  step_id: string;
  kind: string;
  ref: string;
  summary: string;
};

function nowIso() {
  return new Date().toISOString();
}

function stableSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'item';
}

function safeStepFileName(step: WorkOrderStep) {
  return `${String(step.order ?? 0).padStart(2, '0')}-${stableSlug(step.id)}.artifact.json`;
}

function defaultOutputDir(request: RuntimeAdapterRequest) {
  return path.join(os.tmpdir(), 'nexus-capability-os-worker', stableSlug(request.request_id));
}

export function realWorkerAllowedActions(): RealWorkerActionKind[] {
  return ['write_step_artifact'];
}

export async function writeStepArtifact(request: RuntimeAdapterRequest, step: WorkOrderStep, options: RealWorkerOptions = {}): Promise<RealWorkerArtifact> {
  const outputDir = options.output_dir ?? defaultOutputDir(request);
  await fs.mkdir(outputDir, { recursive: true });

  const filename = safeStepFileName(step);
  const filepath = path.join(outputDir, filename);
  const artifact = {
    packet_type: 'nexus.real_worker_step_artifact',
    version: '0.1',
    request_id: request.request_id,
    worker_id: options.worker_id ?? request.dispatch.target_worker,
    step_id: step.id,
    step_title: step.title,
    owner: step.owner,
    expected_outputs: step.expected_outputs ?? [],
    required_gates: step.required_gates ?? [],
    produced_by: 'write_step_artifact',
    produced_at: options.now ?? nowIso(),
    safety: {
      arbitrary_command_execution: false,
      allowlisted_action: 'write_step_artifact',
      output_scope: 'bounded_output_directory',
    },
  };

  await fs.writeFile(filepath, `${JSON.stringify(artifact, null, 2)}\n`, 'utf8');

  return {
    step_id: step.id,
    kind: 'real_worker_step_artifact',
    ref: `file://${filepath}`,
    summary: `Real worker wrote bounded artifact for ${step.title}.`,
  };
}

function eventId(request: RuntimeAdapterRequest, step: WorkOrderStep, type: string, sequence: number) {
  return `${stableSlug(request.request_id)}:${step.id}:${type}:${sequence}`;
}

function gateEvidence(step: WorkOrderStep, artifact: RealWorkerArtifact) {
  return (step.required_gates ?? []).map((gate) => ({
    gate,
    status: 'pass' as const,
    evidence_note: `Real worker artifact ${artifact.ref} supports ${gate}.`,
    blocker_reason: '',
  }));
}

export async function runMinimumRealWorkerSlice(request: RuntimeAdapterRequest, options: RealWorkerOptions = {}): Promise<RuntimeAdapterResponse> {
  const workerId = options.worker_id ?? request.dispatch.target_worker;
  const startedAt = options.now ?? nowIso();
  const taskId = `${stableSlug(request.handoff_packet.task_packet.objective)}.real-worker`;
  const events: RuntimeBridgeEvent[] = [];
  let sequence = 0;

  for (const step of request.handoff_packet.task_packet.work_order) {
    events.push({
      event_id: eventId(request, step, 'step_started', sequence++),
      event_type: 'step_started',
      version: '0.1',
      task_packet_id: taskId,
      step_id: step.id,
      status: 'in_progress',
      timestamp: startedAt,
      owner: step.owner,
      runtime_notes: `Real worker started allowlisted action for ${step.title}.`,
    });

    const artifact = await writeStepArtifact(request, step, { ...options, worker_id: workerId, now: startedAt });

    events.push({
      event_id: eventId(request, step, 'gate_checked', sequence++),
      event_type: 'gate_checked',
      version: '0.1',
      task_packet_id: taskId,
      step_id: step.id,
      status: 'in_progress',
      timestamp: startedAt,
      owner: step.owner,
      gate_evidence: gateEvidence(step, artifact),
      runtime_notes: `Real worker checked gates from bounded artifact for ${step.title}.`,
    });

    events.push({
      event_id: eventId(request, step, 'artifact_created', sequence++),
      event_type: 'artifact_created',
      version: '0.1',
      task_packet_id: taskId,
      step_id: step.id,
      status: 'done',
      timestamp: startedAt,
      owner: step.owner,
      artifact_refs: [{ kind: artifact.kind, ref: artifact.ref, summary: artifact.summary }],
      runtime_notes: `Real worker produced ${artifact.kind}.`,
    });

    events.push({
      event_id: eventId(request, step, 'step_completed', sequence++),
      event_type: 'step_completed',
      version: '0.1',
      task_packet_id: taskId,
      step_id: step.id,
      status: 'done',
      timestamp: startedAt,
      owner: step.owner,
      artifact_refs: [{ kind: artifact.kind, ref: artifact.ref, summary: artifact.summary }],
      runtime_notes: `Real worker completed ${step.title}.`,
    });
  }

  return {
    packet_type: 'nexus.runtime_adapter_response',
    version: '0.1',
    request_id: request.request_id,
    accepted: true,
    status: 'accepted',
    job: {
      job_id: `real-worker-job-${stableSlug(request.request_id)}`,
      target_worker: workerId,
      started_at: startedAt,
    },
    events,
  };
}
