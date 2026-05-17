import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import skillFixture from '../samples/capability-runtime/skill.review-doc.sample.json' assert { type: 'json' };
import agentFixture from '../samples/capability-runtime/agent.orchestrator.sample.json' assert { type: 'json' };
import subAgentFixture from '../samples/capability-runtime/subagent.verifier.sample.json' assert { type: 'json' };
import toolGrantFixture from '../samples/capability-runtime/tool.read-doc.grant.sample.json' assert { type: 'json' };
import runtimeNoteFixture from '../samples/capability-runtime/memory-note.runtime-philosophy.sample.json' assert { type: 'json' };
import contextNoteFixture from '../samples/capability-runtime/memory-note.context-distillation.sample.json' assert { type: 'json' };
import activeContextFixture from '../samples/capability-runtime/context.docs-review.sample.json' assert { type: 'json' };
import { buildRuntimeAdapterRequest, type TaskPacket } from '../src/runtimeAdapter.ts';
import {
  validateEvaluationObservation,
  validateRuntimeLoopCycle,
  type ActiveContextBundle,
  type AgentProfile,
  type MemoryNote,
  type SkillPackage,
  type SubAgentDelegation,
  type ToolGrant,
} from '../src/capabilityRuntimeContracts.ts';
import { mapControlledWorkerResponseToRuntimeLoop } from '../src/controlledWorkerRuntimeMapping.ts';
import { runControlledWorkerV2, type ControlledWorkerManifest } from '../server/controlled-worker-v2.ts';

const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-controlled-worker-runtime-mapping-'));

const samplePacket: TaskPacket = {
  packet_type: 'nexus.task_packet',
  version: '0.1',
  objective: 'Verify controlled worker runtime mapping',
  source_compiler_rule: 'verify-controlled-worker-runtime-mapping',
  routing: {
    macro_pipeline: 'software-development',
    micro_pipelines: ['capability-runtime', 'controlled-worker-mapping'],
    capability_packs: ['capability-runtime-pack'],
    skills: ['quality-assurance-skill', 'review-skill'],
  },
  skills: [
    { skill: 'quality-assurance-skill', required: true },
    { skill: 'review-skill', required: true },
  ],
  team: [{ profile: 'runtime-adapter-engineer', role: 'owner_or_reviewer' }],
  gates: [
    { gate: 'controlled-worker-output', required: true },
    { gate: 'runtime-loop-mapping', required: true },
  ],
  policies: {
    memory: 'project-decision-memory',
    context: 'software-working-set-context',
  },
  work_order: [
    {
      order: 1,
      id: '01-controlled-runtime-mapping',
      title: 'Map Controlled Worker Output',
      owner: 'runtime-adapter-engineer',
      description: 'Map bounded controlled worker output into Capability Runtime loop data.',
      expected_outputs: ['controlled_step_artifact'],
      required_gates: ['controlled-worker-output', 'runtime-loop-mapping'],
      status: 'not_started',
    },
  ],
};

const manifest: ControlledWorkerManifest = {
  packet_type: 'nexus.controlled_worker_manifest',
  version: '0.1',
  manifest_id: 'verify-controlled-worker-runtime-mapping',
  actions: [
    {
      action_id: 'write-runtime-artifact',
      action_kind: 'write_step_artifact',
      step_id: '01-controlled-runtime-mapping',
      output_kind: 'controlled_runtime_artifact',
    },
    {
      action_id: 'write-runtime-manifest-summary',
      action_kind: 'write_manifest_summary',
      output_kind: 'controlled_runtime_manifest_summary',
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
  now: '2026-05-17T00:00:00.000Z',
});

const mapping = mapControlledWorkerResponseToRuntimeLoop({
  taskRef: 'task.controlled-worker-runtime-mapping',
  response,
  skill: skillFixture as SkillPackage,
  agent: agentFixture as AgentProfile,
  subAgent: subAgentFixture as SubAgentDelegation,
  context: activeContextFixture as ActiveContextBundle,
  toolGrants: [toolGrantFixture as ToolGrant],
  memoryNotes: [runtimeNoteFixture as MemoryNote, contextNoteFixture as MemoryNote],
});

const observationValidation = validateEvaluationObservation(mapping.observation);
const cycleValidation = validateRuntimeLoopCycle(mapping.runtime_cycle);
const controlledWorkerEvents = mapping.runtime_cycle.events.filter((event) => event.event_type.startsWith('controlled_worker.'));
const mappedArtifactRefs = mapping.runtime_cycle.artifact_refs.filter((artifact) => artifact.kind.startsWith('controlled_'));

const assertions = [
  assert('controlled worker response is accepted', response.accepted && response.status === 'accepted', { status: response.status }),
  assert('controlled worker emits events', response.events.length === 3, { events: response.events.map((event) => event.event_type) }),
  assert('mapping observation is valid', observationValidation.valid, { errors: observationValidation.errors }),
  assert('mapping observation is positive', mapping.observation.signal === 'positive', { signal: mapping.observation.signal }),
  assert('runtime loop cycle is valid after mapping', cycleValidation.valid, { errors: cycleValidation.errors }),
  assert('runtime loop includes controlled worker events', controlledWorkerEvents.length === response.events.length, { controlledWorkerEvents }),
  assert('runtime loop includes controlled artifact refs', mappedArtifactRefs.length >= 2, { mappedArtifactRefs }),
  assert('mapping keeps local loop status pass', mapping.runtime_cycle.status === 'pass', { status: mapping.runtime_cycle.status }),
  assert('mapping keeps memory note refs', mapping.runtime_cycle.memory_note_update_refs.length === 2, { memory_note_update_refs: mapping.runtime_cycle.memory_note_update_refs }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'controlled-worker-runtime-mapping',
  status,
  assertions,
  response_summary: {
    event_count: response.events.length,
    artifact_ref_count: response.events.flatMap((event) => event.artifact_refs ?? []).length,
  },
  observation: mapping.observation,
  runtime_cycle_summary: {
    cycle_id: mapping.runtime_cycle.cycle_id,
    status: mapping.runtime_cycle.status,
    event_count: mapping.runtime_cycle.events.length,
    artifact_ref_count: mapping.runtime_cycle.artifact_refs.length,
  },
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Controlled worker runtime mapping verification failed.');
  process.exit(1);
}
