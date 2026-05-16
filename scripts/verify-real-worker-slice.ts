import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildRuntimeAdapterRequest, type TaskPacket } from '../src/runtimeAdapter.ts';
import { isRuntimeAdapterResponse } from '../src/runtimeAdapterProvider.ts';
import { realWorkerAllowedActions, runMinimumRealWorkerSlice } from '../server/real-worker-actions.ts';

const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-real-worker-'));

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify minimum real worker vertical slice',
  source_compiler_rule: 'verify-real-worker-slice',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['runtime-adapter', 'real-worker-slice'],
    capability_packs: ['real-worker-slice-pack'],
    skills: ['quality-assurance-skill', 'review-skill'],
  },
  skills: [
    { skill: 'quality-assurance-skill', required: true },
    { skill: 'review-skill', required: true },
  ],
  team: [{ profile: 'runtime-adapter-engineer', role: 'owner_or_reviewer' }],
  gates: [
    { gate: 'allowlist-boundary', required: true },
    { gate: 'artifact-created', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-write-artifact',
      title: 'Write Real Worker Artifact',
      owner: 'runtime-adapter-engineer',
      description: 'Use the allowlisted real worker action to write one bounded artifact.',
      expected_outputs: ['real_worker_step_artifact'],
      required_gates: ['allowlist-boundary', 'artifact-created'],
      status: 'not_started',
    },
  ],
};

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const request = buildRuntimeAdapterRequest(samplePacket, 'real');
request.dispatch.target_worker = 'minimum-real-worker';

const response = await runMinimumRealWorkerSlice(request, {
  worker_id: 'minimum-real-worker',
  output_dir: outputDir,
  now: '2026-05-16T00:00:00.000Z',
});

const artifactCreatedEvents = response.events.filter((event) => event.event_type === 'artifact_created');
const completionArtifactRefs = response.events
  .filter((event) => event.event_type === 'step_completed')
  .flatMap((event) => event.artifact_refs ?? []);
const artifactRefs = artifactCreatedEvents.flatMap((event) => event.artifact_refs ?? []);
const artifactFilePaths = artifactRefs
  .filter((artifact) => artifact.ref.startsWith('file://'))
  .map((artifact) => artifact.ref.replace('file://', ''));
const artifactFilesExist = artifactFilePaths.length > 0 && artifactFilePaths.every((filePath) => fs.existsSync(filePath));
const artifactPayloads = artifactFilePaths.map((filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8')));

const assertions = [
  assert('only allowlisted actions are exposed', realWorkerAllowedActions().length === 1 && realWorkerAllowedActions()[0] === 'write_step_artifact', { actions: realWorkerAllowedActions() }),
  assert('runtime adapter response shape is valid', isRuntimeAdapterResponse(response), { packet_type: response.packet_type, status: response.status }),
  assert('real worker target is carried in job metadata', response.job.target_worker === 'minimum-real-worker', { target_worker: response.job.target_worker }),
  assert('runtime events include started, gate, artifact and completion', response.events.length === 4, { event_types: response.events.map((event) => event.event_type) }),
  assert('artifact-created event emits one artifact ref', artifactRefs.length === 1, { artifactRefs }),
  assert('completion event carries artifact ref', completionArtifactRefs.length === 1, { completionArtifactRefs }),
  assert('artifact files exist inside output directory', artifactFilesExist, { artifactFilePaths, outputDir }),
  assert('artifact payload marks arbitrary command execution as false', artifactPayloads.every((payload) => payload.safety?.arbitrary_command_execution === false), { artifactPayloads }),
  assert('gate evidence is generated from artifact', response.events.some((event) => event.event_type === 'gate_checked' && (event.gate_evidence ?? []).length === 2), { gateEvents: response.events.filter((event) => event.event_type === 'gate_checked') }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'minimum-real-worker-slice',
  status,
  assertions,
  output_dir: outputDir,
  response_summary: {
    accepted: response.accepted,
    status: response.status,
    event_count: response.events.length,
    artifact_ref_count: artifactRefs.length,
    completion_artifact_ref_count: completionArtifactRefs.length,
    target_worker: response.job.target_worker,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Minimum real worker vertical slice verification failed.');
  process.exit(1);
}