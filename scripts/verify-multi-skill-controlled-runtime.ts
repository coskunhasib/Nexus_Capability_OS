import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import taskFixture from '../samples/controlled-runtime/multi-skill.task.sample.json' assert { type: 'json' };
import manifestFixture from '../samples/controlled-runtime/multi-skill.manifest.sample.json' assert { type: 'json' };
import skillFixture from '../samples/capability-runtime/skill.review-doc.sample.json' assert { type: 'json' };
import agentFixture from '../samples/capability-runtime/agent.orchestrator.sample.json' assert { type: 'json' };
import subAgentFixture from '../samples/capability-runtime/subagent.verifier.sample.json' assert { type: 'json' };
import toolGrantFixture from '../samples/capability-runtime/tool.read-doc.grant.sample.json' assert { type: 'json' };
import runtimeNoteFixture from '../samples/capability-runtime/memory-note.runtime-philosophy.sample.json' assert { type: 'json' };
import contextNoteFixture from '../samples/capability-runtime/memory-note.context-distillation.sample.json' assert { type: 'json' };
import activeContextFixture from '../samples/capability-runtime/context.docs-review.sample.json' assert { type: 'json' };
import { buildRuntimeAdapterRequest, type TaskPacket } from '../src/runtimeAdapter.ts';
import { mapControlledWorkerResponseToRuntimeLoop } from '../src/controlledWorkerRuntimeMapping.ts';
import { validateRuntimeLoopCycle, type ActiveContextBundle, type AgentProfile, type MemoryNote, type SkillPackage, type SubAgentDelegation, type ToolGrant } from '../src/capabilityRuntimeContracts.ts';
import { isControlledWorkerManifest, runControlledWorkerV2, type ControlledWorkerManifest } from '../server/controlled-worker-v2.ts';

function assert(name: string, pass: boolean, details?: Record<string, unknown>) {
  return { name, pass, details };
}

const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nexus-multi-skill-controlled-'));
const taskPacket = taskFixture as TaskPacket;
const manifest = manifestFixture as ControlledWorkerManifest;
const request = buildRuntimeAdapterRequest(taskPacket, 'real');
request.dispatch.target_worker = 'controlled-worker-v2';

const response = await runControlledWorkerV2(request, manifest, {
  worker_id: 'controlled-worker-v2',
  output_dir: outputDir,
  now: '2026-05-17T00:00:00.000Z',
});

const mapping = mapControlledWorkerResponseToRuntimeLoop({
  taskRef: 'task.multi-skill-controlled-runtime',
  response,
  skill: skillFixture as SkillPackage,
  agent: agentFixture as AgentProfile,
  subAgent: subAgentFixture as SubAgentDelegation,
  context: activeContextFixture as ActiveContextBundle,
  toolGrants: [toolGrantFixture as ToolGrant],
  memoryNotes: [runtimeNoteFixture as MemoryNote, contextNoteFixture as MemoryNote],
});

const cycleValidation = validateRuntimeLoopCycle(mapping.runtime_cycle);
const skills = taskPacket.skills.map((skill) => skill.skill);
const completedSteps = new Set(response.events.filter((event) => event.event_type === 'step_completed').map((event) => event.step_id));
const artifactKinds = response.events.flatMap((event) => event.artifact_refs ?? []).map((artifact) => artifact.kind);
const controlledEvents = mapping.runtime_cycle.events.filter((event) => event.event_type.startsWith('controlled_worker.'));

const assertions = [
  assert('task fixture has at least two skills', skills.length >= 2, { skills }),
  assert('task fixture includes quality skill', skills.includes('quality-assurance-skill'), { skills }),
  assert('task fixture includes review skill', skills.includes('review-skill'), { skills }),
  assert('manifest fixture is valid', isControlledWorkerManifest(manifest), { manifest_id: manifest.manifest_id }),
  assert('controlled response accepted', response.accepted && response.status === 'accepted', { status: response.status }),
  assert('both work-order steps completed', completedSteps.has('01-quality-evidence') && completedSteps.has('02-review-evidence'), { completedSteps: Array.from(completedSteps) }),
  assert('quality artifact exists', artifactKinds.includes('quality_evidence_artifact'), { artifactKinds }),
  assert('review artifact exists', artifactKinds.includes('review_evidence_artifact'), { artifactKinds }),
  assert('runtime loop cycle is valid', cycleValidation.valid, { errors: cycleValidation.errors }),
  assert('runtime loop includes controlled events', controlledEvents.length === response.events.length, { controlledEventCount: controlledEvents.length, responseEventCount: response.events.length }),
  assert('runtime loop includes mapped artifacts', mapping.runtime_cycle.artifact_refs.some((artifact) => artifact.kind === 'quality_evidence_artifact') && mapping.runtime_cycle.artifact_refs.some((artifact) => artifact.kind === 'review_evidence_artifact'), { artifact_refs: mapping.runtime_cycle.artifact_refs }),
];

const status = assertions.every((item) => item.pass) ? 'pass' : 'fail';
const result = {
  suite_id: 'multi-skill-controlled-runtime',
  status,
  assertions,
  outputDir,
  event_count: response.events.length,
  artifact_kinds: artifactKinds,
};

console.log(JSON.stringify(result, null, 2));

if (status !== 'pass') {
  console.error('Multi-skill controlled runtime verification failed.');
  process.exit(1);
}
