import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { RuntimeAdapterRequest, RuntimeAdapterResponse, RuntimeBridgeEvent, WorkOrderStep } from '../src/runtimeAdapter.ts';

export type ControlledWorkerActionKind = 'write_step_artifact' | 'write_manifest_summary';

export type ControlledWorkerManifestAction = {
  action_id: string;
  action_kind: ControlledWorkerActionKind;
  step_id?: string;
  output_kind?: string;
};

export type ControlledWorkerManifest = {
  packet_type: 'nexus.controlled_worker_manifest';
  version: '0.1';
  manifest_id: string;
  actions: ControlledWorkerManifestAction[];
};

export type ControlledWorkerV2Options = {
  output_dir?: string;
  worker_id?: string;
  now?: string;
};

type ControlledArtifact = {
  kind: string;
  ref: string;
  summary: string;
  step_id?: string;
};

function nowIso() {
  return new Date().toISOString();
}

function stableSlug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 64) || 'item';
}

function defaultOutputDir(request: RuntimeAdapterRequest) {
  return path.join(os.tmpdir(), 'nexus-controlled-worker-v2', stableSlug(request.request_id));
}

function findStep(request: RuntimeAdapterRequest, stepId?: string): WorkOrderStep | undefined {
  if (!stepId) return undefined;
  return request.handoff_packet.task_packet.work_order.find((step) => step.id === stepId);
}

function eventId(request: RuntimeAdapterRequest, action: ControlledWorkerManifestAction, type: string, index: number) {
  return `${stableSlug(request.request_id)}:${stableSlug(action.action_id)}:${type}:${index}`;
}

async function writeJsonArtifact(outputDir: string, filename: string, payload: unknown) {
  await fs.mkdir(outputDir, { recursive: true });
  const filePath = path.join(outputDir, filename);
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return `file://${filePath}`;
}

async function runAction(
  request: RuntimeAdapterRequest,
  manifest: ControlledWorkerManifest,
  action: ControlledWorkerManifestAction,
  options: ControlledWorkerV2Options,
): Promise<{ artifact: ControlledArtifact; step?: WorkOrderStep }> {
  const outputDir = options.output_dir ?? defaultOutputDir(request);
  const workerId = options.worker_id ?? request.dispatch.target_worker;
  const timestamp = options.now ?? nowIso();
  const step = findStep(request, action.step_id);

  if (action.action_kind === 'write_step_artifact') {
    if (!step) throw new Error(`Unknown step_id for action ${action.action_id}.`);
    const kind = action.output_kind ?? 'controlled_step_artifact';
    const ref = await writeJsonArtifact(outputDir, `${stableSlug(action.action_id)}.json`, {
      packet_type: 'nexus.controlled_worker_artifact',
      version: '0.1',
      request_id: request.request_id,
      manifest_id: manifest.manifest_id,
      action_id: action.action_id,
      action_kind: action.action_kind,
      worker_id: workerId,
      step_id: step.id,
      step_title: step.title,
      kind,
      produced_at: timestamp,
      safety: {
        allowlisted_action: action.action_kind,
        output_scope: 'bounded_output_directory',
        direct_external_runtime: false,
      },
    });
    return {
      step,
      artifact: {
        kind,
        ref,
        step_id: step.id,
        summary: `Controlled worker wrote ${kind} for ${step.title}.`,
      },
    };
  }

  const ref = await writeJsonArtifact(outputDir, `${stableSlug(action.action_id)}.json`, {
    packet_type: 'nexus.controlled_worker_manifest_summary',
    version: '0.1',
    request_id: request.request_id,
    manifest_id: manifest.manifest_id,
    action_id: action.action_id,
    action_kind: action.action_kind,
    worker_id: workerId,
    action_count: manifest.actions.length,
    produced_at: timestamp,
    safety: {
      allowlisted_action: action.action_kind,
      output_scope: 'bounded_output_directory',
      direct_external_runtime: false,
    },
  });

  return {
    artifact: {
      kind: action.output_kind ?? 'controlled_manifest_summary',
      ref,
      summary: `Controlled worker wrote manifest summary for ${manifest.manifest_id}.`,
    },
  };
}

export function controlledWorkerV2AllowedActions(): ControlledWorkerActionKind[] {
  return ['write_step_artifact', 'write_manifest_summary'];
}

export function isControlledWorkerManifest(value: unknown): value is ControlledWorkerManifest {
  const candidate = value as ControlledWorkerManifest;
  return Boolean(
    candidate &&
    candidate.packet_type === 'nexus.controlled_worker_manifest' &&
    candidate.version === '0.1' &&
    typeof candidate.manifest_id === 'string' &&
    Array.isArray(candidate.actions) &&
    candidate.actions.every((action) =>
      typeof action.action_id === 'string' &&
      controlledWorkerV2AllowedActions().includes(action.action_kind),
    )
  );
}

export async function runControlledWorkerV2(
  request: RuntimeAdapterRequest,
  manifest: ControlledWorkerManifest,
  options: ControlledWorkerV2Options = {},
): Promise<RuntimeAdapterResponse> {
  if (!isControlledWorkerManifest(manifest)) {
    throw new Error('Invalid controlled worker manifest.');
  }

  const workerId = options.worker_id ?? request.dispatch.target_worker;
  const timestamp = options.now ?? nowIso();
  const taskId = `${stableSlug(request.handoff_packet.task_packet.objective)}.controlled-worker-v2`;
  const events: RuntimeBridgeEvent[] = [];
  let index = 0;

  for (const action of manifest.actions) {
    const { artifact, step } = await runAction(request, manifest, action, options);
    const stepId = step?.id ?? action.step_id ?? 'manifest';
    const owner = step?.owner ?? 'controlled-worker';
    const status = 'done' as const;
    const artifactRefs = [{ kind: artifact.kind, ref: artifact.ref, summary: artifact.summary }];

    events.push({
      event_id: eventId(request, action, 'artifact_created', index++),
      event_type: 'artifact_created',
      version: '0.1',
      task_packet_id: taskId,
      step_id: stepId,
      status,
      timestamp,
      owner,
      artifact_refs: artifactRefs,
      runtime_notes: `Controlled worker action ${action.action_kind} completed.`,
    });

    if (step) {
      events.push({
        event_id: eventId(request, action, 'step_completed', index++),
        event_type: 'step_completed',
        version: '0.1',
        task_packet_id: taskId,
        step_id: step.id,
        status,
        timestamp,
        owner: step.owner,
        artifact_refs: artifactRefs,
        runtime_notes: `Controlled worker completed ${step.title}.`,
      });
    }
  }

  return {
    packet_type: 'nexus.runtime_adapter_response',
    version: '0.1',
    request_id: request.request_id,
    accepted: true,
    status: 'accepted',
    job: {
      job_id: `controlled-worker-v2-job-${stableSlug(request.request_id)}`,
      target_worker: workerId,
      started_at: timestamp,
    },
    events,
  };
}
