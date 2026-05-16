import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildRuntimeAdapterRequest, type TaskPacket } from '../src/runtimeAdapter.ts';
import { isRuntimeAdapterResponse } from '../src/runtimeAdapterProvider.ts';
import {
  controlledWorkerV2AllowedActions,
  isControlledWorkerManifest,
  runControlledWorkerV2,
  type ControlledWorkerManifest,
} from '../server/controlled-worker-v2.ts';

const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-controlled-worker-v2-'));

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify local controlled worker v2',
  source_compiler_rule: 'verify-controlled-worker-v2',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['runtime-adapter', 'controlled-worker-v2'],
    capability_packs: ['controlled-worker-v2-pack'],
    skills: ['quality-assurance-skill', 'review-skill'],
  },
  skills: [
    { skill: 'quality-assurance-skill', required: true },
    { skill: 'review-skill', required: true },
  ],
  team: [{ profile: 'runtime-adapter-engineer', role: 'owner_or_reviewer' }],
  gates: [
    { gate: 'manifest-boundary', required: true },
    { gate: 'artifact-created', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-controlled-artifact',
      title: 'Write Controlled Artifact',
      owner: 'runtime-adapter-engineer',
      description: 'Use the manifest-driven worker to write a bounded artifact.',
      expected_outputs: ['controlled_step_artifact'],
      required_gates: ['manifest-boundary', 'artifact-created'],
      status: 'not_started',
    },
  ],
};

const manifest: ControlledWorkerManifest = {
  packet_type: 'nexus.controlled_worker_manifest',
  version: '0.1',
  manifest_id: 'verify-controlled-worker-v2',
  actions: [
    {
      action_id: 'write-step-artifact',
      action_kind: 'write_step_artifact',
      step_id: '01-controlled-artifact',
      output_kind: 'controlled_step_artifact',
    },
    {
      action_id: 'write-manifest-summary',
      action_kind: 'write_manifest_summary',
      output_kind: 'controlled_manifest_summary',
    },
  ],
};

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const request = buildRuntimeAdapterRequest(samplePacket, 'real');
request.dispatch.target_worker = 'controlled-worker-v2';

const response = await runControlledWorkerV2(request, manifest, {
  worker_id: 'controlled-worker-v2',
  output_dir: outputDir,
  now: '2026-05-16T00:00:00.000Z',
});

const artifactRefs = response.events.flatMap((event) => event.artifact_refs ?? []);
const artifactPaths = artifactRefs
  .map((artifact) => artifact.ref)
  .filter((ref) => ref.startsWith('file://'))
  .map((ref) => ref.replace('file://', ''));
const uniqueArtifactPaths = [...new Set(artifactPaths)];
const artifactsExist = uniqueArtifactPaths.length === 2 && uniqueArtifactPaths.every((filePath) => fs.existsSync(filePath));
const artifactPayloads = uniqueArtifactPaths.map((filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8')));

const assertions = [
  assert('manifest shape is valid', isControlledWorkerManifest(manifest), { manifest }),
  assert('allowed actions are explicit', controlledWorkerV2AllowedActions().join(',') === 'write_step_artifact,write_manifest_summary', { actions: controlledWorkerV2AllowedActions() }),
  assert('runtime adapter response shape is valid', isRuntimeAdapterResponse(response), { packet_type: response.packet_type, status: response.status }),
  assert('response target worker is controlled worker v2', response.job.target_worker === 'controlled-worker-v2', { target_worker: response.job.target_worker }),
  assert('events are produced from manifest actions', response.events.length === 3, { event_types: response.events.map((event) => event.event_type) }),
  assert('artifact refs are emitted', artifactRefs.length === 3, { artifactRefs }),
  assert('unique artifact files exist', artifactsExist, { uniqueArtifactPaths, outputDir }),
  assert('artifact payloads stay in bounded output policy', artifactPayloads.every((payload) => payload.safety?.output_scope === 'bounded_output_directory'), { artifactPayloads }),
  assert('artifact payloads do not mark direct external runtime usage', artifactPayloads.every((payload) => payload.safety?.direct_external_runtime === false), { artifactPayloads }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'controlled-worker-v2',
  status,
  assertions,
  output_dir: outputDir,
  response_summary: {
    accepted: response.accepted,
    status: response.status,
    event_count: response.events.length,
    artifact_ref_count: artifactRefs.length,
    unique_artifact_count: uniqueArtifactPaths.length,
    target_worker: response.job.target_worker,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Controlled worker v2 verification failed.');
  process.exit(1);
}
